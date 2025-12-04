import db from "../models/index.js"; // assuming your models/index.js exports all models
import { logInfo, logWarning, logError } from "../helper/index.js";
import Community_Blog from "../models/Community_Blog.js";
import { Op, Sequelize } from "sequelize";
const Blog = db.CommunityBlog;

const { User, CommunityBlog, ContentInteractionLog } = db;
// export const createBlogPost = async (userEmail, blogData) => {
//   try {
//     const user = await User.findOne({
//       where: { EmailId: userEmail, delStatus: 0 },
//       attributes: ["UserID", "Name", "isAdmin"],
//     });

//     if (!user) {
//       logWarning("User not found, please login first.");
//       return {
//         status: 400,
//         response: {
//           success: false,
//           data: {},
//           message: "User not found, please login first.",
//         },
//       };
//     }

//     const isAdmin = user.isAdmin === 1;
//     const status = isAdmin ? "Approved" : "Pending";
//     const approvedBy = isAdmin ? user.Name : null;
//     const approvedOn = isAdmin ? new Date() : null;

//     let repostUserId = null;
//     let repostId = null;

//     if (blogData.repostId && blogData.repostId !== 0) {
//       const originalBlog = await Blog.findOne({
//         where: { BlogID: blogData.repostId, delStatus: 0 },
//         attributes: ["UserID"],
//       });

//       if (originalBlog) {
//         repostUserId = originalBlog.UserID;
//         repostId = blogData.repostId;

//         if (originalBlog.Status === "Approved") {
//           status = "Approved";
//           approvedBy = originalBlog.ApprovedBy || "System Auto-Approval";
//           approvedOn = new Date();
//         }
//       }
//     }

//     const blogPost = await Blog.create({
//       title: blogData.title ?? null,
//       author: blogData.author ?? null,
//       content: blogData.content ?? null,
//       image: blogData.image ?? null,
//       Category: blogData.category ?? null,
//       publishedDate: blogData.publishedDate ?? null,
//       AuthAdd: user.Name,
//       AddOnDt: new Date(),
//       delStatus: 0,
//       Status: status,
//       AdminRemark: null,
//       ApprovedBy: approvedBy,
//       ApprovedOn: approvedOn,
//       UserID: user.UserID,
//       RepostID: blogData.repostId ?? null,
//       RepostUserID: repostUserId ?? null,
//       allowRepost: blogData.allowRepost ?? false, // Fixed: use blogData.allowRepost
//     });

//     console.log("blog body", blogPost);
//     logInfo("Blog posted successfully!");

//     return {
//       status: 200,
//       response: {
//         success: true,
//         data: { postId: blogPost.BlogID },
//         message: "Blog posted successfully!",
//       },
//     };
//   } catch (error) {
//     logError("Blog creation failed:", error);
//     return {
//       status: 500,
//       response: {
//         success: false,
//         data: error,
//         message: "Something went wrong while posting the blog",
//       },
//     };
//   }
// };

export const createBlogPost = async (userEmail, blogData) => {
  try {
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name", "isAdmin"],
    });

    if (!user) {
      logWarning("User not found, please login first.");
      return {
        status: 400,
        response: {
          success: false,
          data: {},
          message: "User not found, please login first.",
        },
      };
    }

    let status = "Draft"; // Default to draft
    let approvedBy = null;
    let approvedOn = null;

    // If not a draft, handle normal publishing flow
    if (!blogData.isDraft) {
      status = "Pending";

      // If admin user and not draft, auto approve
      if (user.isAdmin === 1) {
        status = "Approved";
        approvedBy = user.UserID;
        approvedOn = new Date();
      }
    }

    let repostUserId = null;
    let repostId = null;

    // ✅ Repost check (only for published posts, not drafts)
    if (!blogData.isDraft && blogData.repostId && blogData.repostId !== 0) {
      const originalBlog = await Blog.findOne({
        where: { BlogID: blogData.repostId, delStatus: 0 },
        attributes: ["UserID", "Status", "ApprovedBy", "ApprovedOn"],
      });

      if (originalBlog) {
        repostUserId = originalBlog.UserID;
        repostId = blogData.repostId;

        // ✅ Duplicate repost prevention
        const existingRepost = await Blog.findOne({
          where: {
            RepostUserID: repostUserId,
            RepostID: repostId,
            UserID: user.UserID,
            delStatus: 0,
          },
        });

        if (existingRepost) {
          logWarning("Duplicate repost attempt detected.");
          return {
            status: 400,
            response: {
              success: false,
              message: "You have already reposted this blog.",
            },
          };
        }

        // ✅ Auto-approve repost if original was approved
        if (originalBlog.Status === "Approved") {
          status = "Approved";
          approvedBy = originalBlog.ApprovedBy || "System Auto-Approval";
          approvedOn = new Date();
        }
      }
    }

    // ✅ Create the blog or repost
    const blogPost = await Blog.create({
      title: blogData.title ?? null,
      author: blogData.author ?? null,
      content: blogData.content ?? null,
      image: blogData.image ?? null,
      Category: blogData.category ?? null,
      publishedDate: blogData.isDraft ? null : new Date(), // Only set published date for non-drafts
      AuthAdd: user.UserID,
      AddOnDt: new Date(),
      delStatus: 0,
      Status: status,
      AdminRemark: null,
      ApprovedBy: approvedBy,
      ApprovedOn: approvedOn,
      UserID: user.UserID,
      RepostID: repostId,
      RepostUserID: repostUserId,
      allowRepost: blogData.allowRepost ?? false,
      isDraft: blogData.isDraft ?? true, // Default to true for safety
    });

    const message = blogData.isDraft
      ? "Blog saved as draft successfully!"
      : "Blog posted successfully!";

    logInfo(message);

    return {
      status: 200,
      response: {
        success: true,
        data: {
          postId: blogPost.BlogID,
          status,
          isDraft: blogData.isDraft,
        },
        message: message,
      },
    };
  } catch (error) {
    logError("Blog creation failed:", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong while posting the blog",
      },
    };
  }
};

export const getBlogService = async (userEmail) => {
  const user = await User.findOne({
    where: {
      EmailId: userEmail,
      delStatus: { [Op.or]: [0, null] },
    },
  });

  if (!user) {
    return { success: false, message: "User not found", data: {} };
  }

  const isAdmin = user.isAdmin === 1;

  const userBlogCount = await Blog.count({
    where: {
      UserID: user.UserID,
      delStatus: { [Op.or]: [0, null] },
      [Op.or]: [{ RepostID: null }, { RepostID: 0 }],
    },
  });

  const totalCount = await Blog.count({
    where: {
      delStatus: { [Op.or]: [0, null] },
      ...(isAdmin ? {} : { Status: "Approved" }),
    },
  });

  const blogs = await Blog.findAll({
    where: {
      delStatus: { [Op.or]: [0, null] },
      ...(isAdmin
        ? {}
        : {
            [Op.or]: [{ UserID: user.UserID }, { Status: "Approved" }],
          }),
    },
    order: [["AddOnDt", "DESC"]],
    include: [
      {
        model: User,
        required: false,
        attributes: ["Name"],
      },
    ],
    attributes: [
      "BlogID",
      "title",
      ["AuthAdd", "UserName"],
      "author",
      "content",
      ["Category", "category"],
      "AddOnDt",
      ["AddOnDt", "timestamp"],
      "image",
      "UserID",
      "Status",
      "AdminRemark",
    ],
  });

  console.log("these are blogs", blogs);

  return {
    success: true,
    data: blogs,
    userBlogCount,
    totalCount,
    message: "Blogs fetched successfully",
  };
};

export const getBlogByIdService = async (blogId) => {
  try {
    const blog = await db.CommunityBlog.findOne({
      where: {
        BlogID: blogId,
        delStatus: { [Op.or]: [0, null] },
      },
      include: [
        {
          model: db.User,
          as: "User",
          attributes: ["UserID", "Name"],
        },
        {
          model: db.CommunityBlog,
          as: "reposts",
          required: false,
          where: { delStatus: { [Op.or]: [0, null] } },
          include: [
            {
              model: db.User,
              as: "RepostUser",
              attributes: ["UserID", "Name"],
            },
          ],
        },
      ],
    });

    if (!blog) {
      return {
        success: false,
        status: 404,
        message: "Blog not found",
      };
    }

    return {
      success: true,
      status: 200,
      data: blog,
      message: "Blog fetched successfully",
    };
  } catch (error) {
    console.error("Error in getBlogByIdService:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
    };
  }
};

export const getUserBlogsService = async (userEmail) => {
  try {
    // Step 1: Find user by EmailId
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!user) {
      return { success: false, message: "User not found", data: {} };
    }

    // Step 2: Count total blogs for this user
    const totalCount = await CommunityBlog.count({
      where: {
        UserID: user.UserID,
        delStatus: { [Op.or]: [0, null] },
        [Op.or]: [
          { Status: { [Op.in]: ["Pending", "Rejected", "Approved"] } },
          { isDraft: true },
        ],
      },
    });

    // Fetch blogs
    // Fetch blogs
    const blogs = await CommunityBlog.findAll({
      where: {
        UserID: user.UserID,
        delStatus: { [Op.or]: [0, null] },
        [Op.or]: [
          { Status: { [Op.in]: ["Pending", "Rejected", "Approved"] } },
          { isDraft: true },
        ],
      },
      order: [["AddOnDt", "DESC"]],
      attributes: [
        "BlogID",
        "title",
        ["AuthAdd", "UserName"],
        "author",
        "content",
        ["Category", "category"],
        "publishedDate",
        ["AddOnDt", "timestamp"],
        "image",
        "AddOnDt",
        "UserID",
        "Status",
        "AdminRemark",
        "allowRepost",
        "isDraft",
      ],
      raw: true,
    });

    if (!blogs.length) {
      return {
        success: true,
        data: { blogs: [], totalCount: 0 },
        message: "No blogs found for this user",
      };
    }

    const blogIds = blogs.map((b) => b.BlogID);

    // Step 4: Count reposts for each blog
    const repostCounts = await CommunityBlog.findAll({
      attributes: [
        "RepostID",
        [Sequelize.fn("COUNT", Sequelize.col("RepostID")), "count"],
      ],
      where: {
        RepostID: { [Op.in]: blogIds },
        delStatus: { [Op.or]: [0, null] },
      },
      group: ["RepostID"],
      raw: true,
    });

    // ✅ Step 5: Calculate total likes and average ratings per blog
    const interactionStats = await ContentInteractionLog.findAll({
      attributes: [
        "reference",
        [
          Sequelize.literal(`
            SUM(CASE 
              WHEN LikeStatus = 0 THEN Likes 
              ELSE 0 
            END)
          `),
          "clapCount",
        ],
        [
          Sequelize.literal(`
            AVG(CASE 
              WHEN RatingStatus = 0 THEN Rating 
              ELSE NULL 
            END)
          `),
          "averageRating",
        ],
      ],
      where: {
        ProcessName: "Blog",
        reference: { [Op.in]: blogIds },
        delStatus: { [Op.or]: [0, null] },
      },
      group: ["reference"],
      raw: true,
    });

    // Step 6: Create lookup maps
    const repostMap = Object.fromEntries(
      repostCounts.map((r) => [r.RepostID, Number(r.count)])
    );

    const interactionMap = Object.fromEntries(
      interactionStats.map((i) => [
        i.reference,
        {
          clapCount: Number(i.clapCount) || 0,
          averageRating: Number(i.averageRating) || 0,
        },
      ])
    );

    // Step 7: Merge data
    const blogsWithStats = blogs.map((b) => ({
      ...b,
      repostCount: repostMap[b.BlogID] || 0,
      clapCount: interactionMap[b.BlogID]?.clapCount || 0,
      averageRating: interactionMap[b.BlogID]?.averageRating || 0,
    }));

    // Step 8: Return response
    return {
      success: true,
      data: { blogs: blogsWithStats, totalCount },
      message: "User's blogs fetched successfully",
    };
  } catch (error) {
    console.error("Error in getUserBlogsService:", error);
    return {
      success: false,
      message: "Server error",
      error: error.message,
      data: {},
    };
  }
};

export const getPublicBlogsService = async () => {
  // Step 1: Fetch all approved blogs
  const allBlogs = await Blog.findAll({
    where: {
      delStatus: { [Op.or]: [0, null] },
      Status: "Approved",
    },
    order: [["AddOnDt", "DESC"]],
    attributes: [
      "BlogID",
      "UserID",
      "title",
      "AuthAdd",
      "AddOnDt",
      "Status",
      ["Category", "category"],
      "publishedDate",
      "content",
      "image",
      "allowRepost",
      "RepostID",
      "RepostUserID",
    ],
    include: [
      {
        model: User,
        as: "RepostUser", // association alias from model
        attributes: ["UserID", "Name"],
      },
    ],
  });

  if (!allBlogs || allBlogs.length === 0) {
    return { success: false, message: "No public blogs found", data: [] };
  }

  // Step 2: Separate originals and reposts
  const originals = allBlogs.filter((b) => !b.RepostID);
  const reposts = allBlogs.filter((b) => b.RepostID);

  // Step 3: Group reposts under their parent (original) blog
  const finalData = originals.map((original) => {
    const o = original.toJSON();

    const relatedReposts = reposts
      .filter((r) => r.RepostID === o.BlogID)
      .map((r) => ({
        BlogID: r.BlogID,
        RepostID: r.RepostID,
        RepostUserID: r.RepostUserID,
        RepostDate: r.AddOnDt,
        RepostUser: r.RepostUser ? r.RepostUser.toJSON() : null,
        content: r.content,
        title: r.title,
        image: r.image,
        Status: r.Status,
      }));

    return {
      ...o,
      reposts: relatedReposts,
    };
  });

  // Step 4: Ensure we also include standalone posts with no reposts
  const finalResult = finalData.map((item) => ({
    ...item,
    reposts: item.reposts || [],
  }));

  return {
    success: true,
    data: finalResult,
    message: "Public blogs fetched successfully",
  };
};

export const updateBlogService = async (blogId, user, data) => {
  console.log("shit happened", user);
  const { CommunityBlog } = db;

  // Check blog existence
  const blog = await CommunityBlog.findOne({
    where: { BlogID: blogId, delStatus: 0 },
  });
  if (!blog) {
    return { success: false, status: 404, message: "Blog not found" };
  }

  // Check admin rights
  if (user.isAdmin !== 1) {
    return { success: false, status: 403, message: "You are not authorized" };
  }

  let updateData = {};
  const now = new Date();

  switch (data.Status) {
    case "approve":
      if (blog.Status === "Approved") {
        return {
          success: false,
          status: 400,
          message: "Blog is already approved",
        };
      }
      updateData = {
        Status: "Approved",
        ApprovedBy: user.uniqueId,
        ApprovedOn: now,
        AuthLstEdt: user.uniqueId,
        editOnDt: now,
      };
      break;

    case "reject":
      if (blog.Status === "Rejected") {
        return {
          success: false,
          status: 400,
          message: "Blog is already rejected",
        };
      }
      updateData = {
        Status: "Rejected",
        AdminRemark: data.remark || "",
        AuthLstEdt: user.uniqueId,
        editOnDt: now,
      };
      break;

    case "delete":
      updateData = {
        delStatus: 1,
        AuthLstEdt: user.uniqueId,
        delOnDt: now,
      };
      break;

    default:
      updateData = {
        title: data.title,
        author: data.author,
        content: data.content,
        publishedDate: data.publishedDate,
        Category: data.category,
        image: data.image,
        AuthLstEdt: user.uniqueId,
        editOnDt: now,
      };
      break;
  }

  await CommunityBlog.update(updateData, { where: { BlogID: blogId } });

  return {
    success: true,
    status: 200,
    message: `Blog ${
      data.Status ? data.Status + "d" : "updated"
    } successfully!`,
    data: { blogId },
  };
};

export const handleBlogLikeAction = async (user, postData) => {
  console.log("user at blog like ", user);
  try {
    const blogId = postData.reference;
    if (!blogId) throw new Error("Invalid blog reference");

    // Check if an interaction already exists for this user & blog
    let interaction = await ContentInteractionLog.findOne({
      where: {
        ProcessName: "Blog",
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0,
      },
    });

    const currentDate = new Date();
    const intendedLikeStatus = postData.likes === 1 ? 1 : 0;

    if (interaction) {
      // Update existing interaction - only update if like status is changing
      const updateData = {
        AuthLstEdt: user.UserID, // <-- Use numeric ID here too
        editOnDt: currentDate,
      };

      // Only update Likes if it's changing
      if (interaction.Likes !== intendedLikeStatus) {
        updateData.Likes = intendedLikeStatus;
        updateData.LikeStatus = 0; // Always 0
      }

      await ContentInteraction.update(updateData, {
        where: { id: interaction.id },
      });

      return {
        success: true,
        data: {
          liked: intendedLikeStatus === 1,
          interactionId: interaction.id,
        },
        message:
          intendedLikeStatus === 1
            ? "Blog liked successfully"
            : "Blog unliked successfully",
      };
    }

    const newInteraction = await ContentInteraction.create({
      ProcessName: "Blog",
      UserID: user.UserID,
      reference: blogId,
      Likes: intendedLikeStatus,
      LikeStatus: 0,
      Rating: null,
      RatingStatus: null,
      AuthAdd: user.UserID, // <-- Use numeric ID
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0,
    });

    return {
      success: true,
      data: {
        liked: intendedLikeStatus === 1,
        interactionId: newInteraction.id,
      },
      message:
        intendedLikeStatus === 1
          ? "Blog liked successfully"
          : "Blog unliked successfully",
    };
  } catch (error) {
    console.error("Blog Like Error:", error);
    throw error;
  }
};

export const handleBlogRateAction = async (user, postData) => {
  try {
    const blogId = postData.reference || postData.blogId;
    const ratingValue = postData.rating;

    if (!blogId) throw new Error("Invalid blog reference");
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      throw new Error("Invalid rating value");
    }

    let interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: "Blog",
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0,
      },
    });

    const currentDate = new Date();

    if (interaction) {
      const updateData = {
        Rating: ratingValue,
        RatingStatus: 0,
        AuthLstEdt: user.UserID,
        editOnDt: currentDate,
      };

      await ContentInteraction.update(updateData, {
        where: { id: interaction.id },
      });

      return {
        success: true,
        data: {
          rated: true,
          rating: ratingValue,
          interactionId: interaction.id,
        },
        message: "Blog rated successfully",
      };
    }

    const newInteraction = await ContentInteraction.create({
      ProcessName: "Blog",
      UserID: user.UserID,
      reference: blogId,
      Likes: 0,
      LikeStatus: 0,
      Rating: ratingValue,
      RatingStatus: 0,
      AuthAdd: user.UserID,
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0,
    });

    return {
      success: true,
      data: {
        rated: true,
        rating: ratingValue,
        interactionId: newInteraction.id,
      },
      message: "Blog rated successfully",
    };
  } catch (error) {
    console.error("Blog Rate Error:", error);
    throw error;
  }
};

export const handleBlogLikeAndRateAction = async (user, postData) => {
  try {
    const blogId = postData.reference;
    const likeValue = postData.likes || 0;
    const ratingValue = postData.rating || null;

    if (!blogId) throw new Error("Invalid blog reference");

    let interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: "Blog",
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0,
      },
    });

    const currentDate = new Date();

    if (interaction) {
      const updateData = {
        AuthLstEdt: user.UserID,
        editOnDt: currentDate,
      };

      if (likeValue !== undefined) {
        updateData.Likes = likeValue;
        updateData.LikeStatus = 0;
      }

      if (ratingValue !== undefined && ratingValue !== null) {
        updateData.Rating = ratingValue;
        updateData.RatingStatus = 0;
      }

      await ContentInteraction.update(updateData, {
        where: { id: interaction.id },
      });

      return {
        success: true,
        data: {
          liked: likeValue === 1,
          rating: ratingValue,
          interactionId: interaction.id,
        },
        message: "Blog interaction updated successfully",
      };
    }

    const newInteraction = await ContentInteraction.create({
      ProcessName: "Blog",
      UserID: user.UserID,
      reference: blogId,
      Likes: likeValue || 0,
      LikeStatus: 0,
      Rating: ratingValue,
      RatingStatus: ratingValue ? 0 : null,
      AuthAdd: user.UserID,
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0,
    });

    return {
      success: true,
      data: {
        liked: likeValue === 1,
        rating: ratingValue,
        interactionId: newInteraction.id,
      },
      message: "Blog interaction created successfully",
    };
  } catch (error) {
    console.error("Blog Like & Rate Error:", error);
    throw error;
  }
};

export const getUserBlogInteractionService = async (userId, blogId) => {
  try {
    const interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: "Blog",
        reference: blogId,
        UserID: userId,
        delStatus: 0,
      },
    });

    // Return user's interaction data
    return {
      success: true,
      data: {
        hasLiked: interaction?.Likes === 1,
        userRating: interaction?.Rating || 0,
        likeCount: interaction?.Likes || 0,
      },
    };
  } catch (error) {
    console.error("Error in getUserBlogInteractionService:", error);
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
};

export const getBlogStatsService = async (blogId) => {
  try {
    if (!blogId) {
      return {
        success: false,
        message: "Blog ID is required",
      };
    }

    // Get the sequelize instance from the model
    const sequelize = ContentInteraction.sequelize;

    // Get total likes count
    const totalLikes = await ContentInteraction.count({
      where: {
        ProcessName: "Blog",
        reference: blogId,
        Likes: 1,
        delStatus: 0,
      },
    });

    // Get average rating - FIXED: Use model's sequelize instance
    const ratingData = await ContentInteraction.findOne({
      where: {
        ProcessName: "Blog",
        reference: blogId,
        Rating: { [Op.gt]: 0 },
        delStatus: 0,
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("Rating")), "totalRatings"],
        [sequelize.fn("AVG", sequelize.col("Rating")), "averageRating"],
      ],
      raw: true,
    });

    const totalRatings = parseInt(ratingData?.totalRatings) || 0;
    const averageRating = parseFloat(ratingData?.averageRating) || 0;

    const totalViews = await ContentInteraction.count({
      where: {
        ProcessName: "Blog",
        reference: blogId,
        View: 1, // Make sure your column for views is called 'View'
        delStatus: 0,
      },
    });

    return {
      success: true,
      data: {
        totalLikes,
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        blogId: parseInt(blogId),
        totalViews,
      },
    };
  } catch (error) {
    console.error("Error in getBlogStatsService:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch blog stats",
    };
  }
};

export const userEditBlogPost = async (blogId, userId, blogData) => {
  try {
    console.log(
      "🔍 Service - BlogID:",
      blogId,
      "UserID:",
      userId,
      "Type:",
      typeof userId
    );

    // Validate inputs
    if (!blogId || !userId) {
      console.log("❌ Missing required parameters:", { blogId, userId });
      return {
        status: 400,
        response: {
          success: false,
          message: "Blog ID and User ID are required",
        },
      };
    }

    const numericBlogId = parseInt(blogId);
    const numericUserId = parseInt(userId);

    if (isNaN(numericBlogId) || isNaN(numericUserId)) {
      console.log("❌ Invalid IDs:", { numericBlogId, numericUserId });
      return {
        status: 400,
        response: {
          success: false,
          message: "Invalid Blog ID or User ID",
        },
      };
    }

    console.log("🔍 Validated IDs:", { numericBlogId, numericUserId });

    const blog = await CommunityBlog.findOne({
      where: {
        BlogID: numericBlogId,
        UserID: numericUserId,
      },
    });

    console.log("🔍 Service - Found blog:", blog ? "Yes" : "No");

    if (!blog) {
      console.log("❌ Blog not found or user not authorized");
      return {
        status: 404,
        response: {
          success: false,
          message: "Blog not found or not authorized",
        },
      };
    }

    // Update only allowed fields
    const updatedFields = {
      title: blogData.title,
      content: blogData.content,
      image: blogData.image,
      Category: blogData.category,
      allowRepost: blogData.allowRepost,
      isDraft: blogData.isDraft,
      Status: blogData.Status,
      ApprovedBy: blogData.ApprovedBy || blog.ApprovedBy,
      ApprovedOn: blogData.ApprovedOn || blog.ApprovedOn,
      editOnDt: new Date(),
      AuthLstEdt: userId.toString(),
    };

    console.log("🔄 Updating blog with fields:", updatedFields);

    await blog.update(updatedFields);

    console.log("✅ Blog updated successfully");

    return {
      status: 200,
      response: {
        success: true,
        message: "Blog updated successfully",
        data: blog,
      },
    };
  } catch (err) {
    console.error("❌ Error updating blog:", err);
    return {
      status: 500,
      response: {
        success: false,
        message: "Unexpected error occurred",
        error: err.message,
      },
    };
  }
};

export const softDeleteBlogService = async (blogId, userId) => {
  if (!blogId) {
    throw new Error("Blog ID required");
  }

  const blog = await CommunityBlog.findOne({ where: { BlogID: blogId } });

  if (!blog) {
    throw new Error("Blog not found");
  }

  await blog.update({
    delStatus: 1,
    delOnDt: new Date(),
    AuthDel: userId.toString(), // ✅ store who deleted it
  });

  return blog;
};
