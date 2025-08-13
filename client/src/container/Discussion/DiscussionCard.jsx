import { FaComment } from "react-icons/fa";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";

const DiscussionCard = ({
    discussion,
    handleAddLike,
    openModal,
    handleComment,
}) => {
    return (
        <div className="relative shadow my-4 border border-gray-300 rounded-lg p-4">
            <div>
                <h3 className="text-lg font-bold md:text-lg lg:text-xl xl:text-2xl">
                    {discussion.Title}
                </h3>
                <div className="text-gray-600 text-sm md:text-base lg:text-lg xl:text-xl">
                    {discussion.Content.length > 500 ? (
                        <>
                            {discussion.Content.substring(0, 497)}
                            <span
                                className="text-blue-700 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(discussion);
                                }}
                            >
                                ...see more
                            </span>
                        </>
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: discussion.Content,
                            }}
                        />
                    )}
                </div>
            </div>
            {discussion.Image && (
                <div
                    className="mt-2"
                    onClick={() => openModal(discussion)}
                >
                    <img
                        src={discussion.Image}
                        alt="Discussion"
                        className="max-h-40 w-auto object-cover"
                    />
                </div>
            )}
            <div
                className="mt-2 flex flex-wrap gap-2"
                onClick={() => openModal(discussion)}
            >
                {discussion.Tag && typeof discussion.Tag === "string"
                    ? discussion.Tag.split(",")
                        .filter((tag) => tag)
                        .map((tag, tagIndex) => (
                            <span
                                key={tagIndex}
                                className="bg-DGXgreen text-white rounded-full px-3 py-1 text-xs md:text-sm lg:text-base"
                            >
                                {tag}
                            </span>
                        ))
                    : Array.isArray(discussion.Tag)
                        ? discussion.Tag.map((tag, tagIndex) => (
                            <span
                                key={tagIndex}
                                className="bg-DGXgreen text-white rounded-full px-3 py-1 text-xs md:text-sm lg:text-base"
                            >
                                {tag}
                            </span>
                        ))
                        : null}
            </div>
            <div
                className="mt-2 flex flex-wrap gap-2"
                onClick={() => openModal(discussion)}
            >
                {discussion.ResourceUrl &&
                    typeof discussion.ResourceUrl === "string"
                    ? discussion.ResourceUrl.split(",").map(
                        (link, linkIndex) => (
                            <a
                                key={linkIndex}
                                href={link}
                                onClick={(e) => e.stopPropagation()}
                                className="text-DGXgreen hover:underline text-xs md:text-sm lg:text-base"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {link}
                            </a>
                        )
                    )
                    : Array.isArray(discussion.ResourceUrl)
                        ? discussion.ResourceUrl.map((link, linkIndex) => (
                            <a
                                key={linkIndex}
                                href={link}
                                onClick={(e) => e.stopPropagation()}
                                className="text-DGXgreen hover:underline text-xs md:text-sm lg:text-base"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {link}
                            </a>
                        ))
                        : null}
            </div>
            <div className="mt-4 flex items-center space-x-4">
                <button
                    className="flex items-center text-sm md:text-base lg:text-lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddLike(
                            discussion.DiscussionID,
                            discussion.userLike
                        );
                    }}
                >
                    {discussion.userLike == 1 ? (
                        <AiFillLike />
                    ) : (
                        <AiOutlineLike />
                    )}
                    {discussion.likeCount} Likes
                </button>

                <button
                    className="flex items-center text-DGXgreen text-sm md:text-base lg:text-lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleComment(discussion);
                    }}
                >
                    <FaComment className="mr-2" />
                    {discussion.comment.length} Comments
                </button>
            </div>
        </div>
    );
};

export default DiscussionCard;