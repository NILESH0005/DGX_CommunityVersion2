import db from "../models/index.js"; // assuming your models/index.js exports all models
import { logInfo, logWarning, logError } from "../helper/index.js";
import Community_Blog from "../models/Community_Blog.js";
import { Op, Sequelize } from "sequelize";
const Blog = db.CommunityBlog;

const { User, CommunityBlog, ContentInteraction } = db;
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

    let status = "Pending";
    let approvedBy = null;
    let approvedOn = null;

    // If admin user, auto approve
    if (user.isAdmin === 1) {
      status = "Approved";
      approvedBy = user.Name;
      approvedOn = new Date();
    }

    let repostUserId = null;
    let repostId = null;

    // ✅ Repost check
    if (blogData.repostId && blogData.repostId !== 0) {
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
            UserID: user.UserID, // current user reposting
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
      publishedDate: blogData.publishedDate ?? null,
      AuthAdd: user.Name,
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
    });

    logInfo("Blog posted successfully!");

    return {
      status: 200,
      response: {
        success: true,
        data: { postId: blogPost.BlogID, status },
        message: "Blog posted successfully!",
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
        Status: { [Op.in]: ["Pending", "Rejected", "Approved"] },
      },
    });

    // Step 3: Fetch all blogs for this user
    const blogs = await CommunityBlog.findAll({
      where: {
        UserID: user.UserID,
        delStatus: { [Op.or]: [0, null] },
        Status: { [Op.in]: ["Pending", "Rejected", "Approved"] },
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
    const interactionStats = await ContentInteraction.findAll({
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
  const originals = allBlogs.filter(b => !b.RepostID);
  const reposts = allBlogs.filter(b => b.RepostID);

  // Step 3: Group reposts under their parent (original) blog
  const finalData = originals.map(original => {
    const o = original.toJSON();

    const relatedReposts = reposts
      .filter(r => r.RepostID === o.BlogID)
      .map(r => ({
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
  const finalResult = finalData.map(item => ({
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
        ApprovedBy: user.id,
        ApprovedOn: now,
        AuthLstEdt: user.id,
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
        AuthLstEdt: user.id,
        editOnDt: now,
      };
      break;

    case "delete":
      updateData = {
        delStatus: 1,
        AuthLstEdt: user.id,
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
        AuthLstEdt: user.id,
        editOnDt: now,
      };
      break;
  }

  await CommunityBlog.update(updateData, { where: { BlogID: blogId } });

  return {
    success: true,
    status: 200,
    message: `Blog ${data.Status ? data.Status + "d" : "updated"
      } successfully!`,
    data: { blogId },
  };
};

// export const handleBlogLikeAction = async (user, postData) => {
//   try {
//     const blogId = postData.reference;
//     if (!blogId) throw new Error("Invalid blog reference");

//     // Check if an interaction already exists for this user & blog
//     let interaction = await ContentInteraction.findOne({
//       where: {
//         ProcessName: 'Blog',
//         UserID: user.UserID,
//         reference: blogId,
//         delStatus: 0
//       },
//     });

//     const currentDate = new Date();
//     const intendedLikeStatus = postData.likes === 1 ? 1 : 0;

//     if (interaction) {
//       // Update existing interaction - only update if like status is changing
//       if (interaction.Likes !== intendedLikeStatus) {
//         const updateData = {
//           Likes: intendedLikeStatus,
//           LikeStatus: 0, // Always set to 0 as per requirement
//           AuthLstEdt: user.Name,
//           editOnDt: currentDate, // Only update when there's a change
//         };

//         await ContentInteraction.update(updateData, {
//           where: { id: interaction.id },
//         });
//       }

//       return {
//         success: true,
//         data: {
//           liked: intendedLikeStatus === 1,
//           interactionId: interaction.id,
//         },
//         message:
//           intendedLikeStatus === 1
//             ? "Blog liked successfully"
//             : "Blog unliked successfully",
//       };
//     }

//     // Create new interaction if it doesn't exist
//     const newInteraction = await ContentInteraction.create({
//       ProcessName: 'Blog',
//       UserID: user.UserID,
//       reference: blogId,
//       Likes: intendedLikeStatus,
//       LikeStatus: 0, // Always 0 for like operations
//       Rating: null, // null for like operations
//       RatingStatus: null, // null for like operations
//       AuthAdd: user.Name,
//       AuthDel: null,
//       AuthLstEdt: null, // No edit on creation
//       delOnDt: null,
//       AddOnDt: currentDate,
//       editOnDt: null, // null on initial creation
//       delStatus: 0
//     });

//     return {
//       success: true,
//       data: {
//         liked: intendedLikeStatus === 1,
//         interactionId: newInteraction.id,
//       },
//       message:
//         intendedLikeStatus === 1
//           ? "Blog liked successfully"
//           : "Blog unliked successfully",
//     };
//   } catch (error) {
//     console.error("Blog Like Error:", error);
//     throw error;
//   }
// };
export const handleBlogLikeAction = async (user, postData) => {
  try {
    const blogId = postData.reference;
    if (!blogId) throw new Error("Invalid blog reference");

    // Check if an interaction already exists for this user & blog
    let interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: 'Blog',
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0
      },
    });

    const currentDate = new Date();
    const intendedLikeStatus = postData.likes === 1 ? 1 : 0;

    if (interaction) {
      // Update existing interaction - only update if like status is changing
      const updateData = {
        AuthLstEdt: user.Name,
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

    // Create new interaction if it doesn't exist
    const newInteraction = await ContentInteraction.create({
      ProcessName: 'Blog',
      UserID: user.UserID,
      reference: blogId,
      Likes: intendedLikeStatus,
      LikeStatus: 0, // Always 0 for like operations
      Rating: null, // null for like operations
      RatingStatus: null, // null for like operations
      AuthAdd: user.Name,
      AuthDel: null,
      AuthLstEdt: null, // No edit on creation
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null, // null on initial creation
      delStatus: 0
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
        ProcessName: 'Blog',
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0
      },
    });

    const currentDate = new Date();

    if (interaction) {
      const updateData = {
        Rating: ratingValue,
        RatingStatus: 0,
        AuthLstEdt: user.Name,
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
      ProcessName: 'Blog',
      UserID: user.UserID,
      reference: blogId,
      Likes: 0,
      LikeStatus: 0,
      Rating: ratingValue,
      RatingStatus: 0,
      AuthAdd: user.Name,
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0
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
        ProcessName: 'Blog',
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0
      },
    });

    const currentDate = new Date();

    if (interaction) {
      const updateData = {
        AuthLstEdt: user.Name,
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
      ProcessName: 'Blog',
      UserID: user.UserID,
      reference: blogId,
      Likes: likeValue || 0,
      LikeStatus: 0,
      Rating: ratingValue,
      RatingStatus: ratingValue ? 0 : null,
      AuthAdd: user.Name,
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0
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
        ProcessName: 'Blog',
        reference: blogId,
        UserID: userId,
        delStatus: 0
      }
    });

    // Return user's interaction data
    return {
      success: true,
      data: {
        hasLiked: interaction?.Likes === 1,
        userRating: interaction?.Rating || 0,
        likeCount: interaction?.Likes || 0
      }
    };
  } catch (error) {
    console.error("Error in getUserBlogInteractionService:", error);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
};

export const getBlogStatsService = async (blogId) => {
  try {
    if (!blogId) {
      return {
        success: false,
        message: "Blog ID is required"
      };
    }

    // Get the sequelize instance from the model
    const sequelize = ContentInteraction.sequelize;

    // Get total likes count
    const totalLikes = await ContentInteraction.count({
      where: {
        ProcessName: 'Blog',
        reference: blogId,
        Likes: 1,
        delStatus: 0
      }
    });

    // Get average rating - FIXED: Use model's sequelize instance
    const ratingData = await ContentInteraction.findOne({
      where: {
        ProcessName: 'Blog',
        reference: blogId,
        Rating: { [Op.gt]: 0 },
        delStatus: 0
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Rating')), 'totalRatings'], // ✅ Fixed
        [sequelize.fn('AVG', sequelize.col('Rating')), 'averageRating']   // ✅ Fixed
      ],
      raw: true
    });

    const totalRatings = parseInt(ratingData?.totalRatings) || 0;
    const averageRating = parseFloat(ratingData?.averageRating) || 0;

    return {
      success: true,
      data: {
        totalLikes,
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        blogId: parseInt(blogId)
      }
    };
  } catch (error) {
    console.error("Error in getBlogStatsService:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch blog stats"
    };
  }
};





