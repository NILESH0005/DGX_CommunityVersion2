import { AiOutlineComment } from "react-icons/ai";
import Skeleton from "react-loading-skeleton";
import { FaSearch, FaTrophy } from "react-icons/fa";


const DiscussionSidebar = ({
    communityHighlights,
    topUsers,
    isLoading,
    openModal
}) => {
    return (
        <aside className="hidden lg:block lg:w-1/4 px-4">
            <div className="mb-8">
                <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4">
                    <AiOutlineComment className="inline-block mr-2" />
                    Community Highlights
                </h2>

                <div className="space-y-4">
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                height="8.5rem"
                                className="w-full bg-gray-300 rounded-lg mb-4"
                            />
                        ))
                        : communityHighlights.map((topic) => (
                            <div
                                key={topic.DiscussionID}
                                className="rounded-lg shadow-lg p-4 border hover:bg-DGXgreen/50 border-DGXblack transition-transform transform hover:scale-105 hover:shadow-xl"
                                onClick={() => openModal(topic)}
                            >
                                <h3 className="text-xl font-semibold">
                                    <a
                                        href={topic.link}
                                        className="text-DGXblack hover:underline"
                                    >
                                        {topic.Title}
                                    </a>
                                </h3>
                                <p className="text-DGXblack mt-2">
                                    {topic.Content.substring(0, 150)}
                                </p>
                            </div>
                        ))}
                </div>
            </div>

            <div>
                <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4">
                    <FaTrophy className="inline-block mr-2" />
                    Top Contributors
                </h2>
                <div className="space-y-2">
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                height="2.5rem"
                                className="w-full bg-gray-300 rounded-lg mb-4"
                            />
                        ))
                        : topUsers.map((user, index) => (
                            <div
                                key={user.userID}
                                className="flex justify-between items-center bg-DGXblue border border-gray-200 rounded-lg shadow-sm p-3 hover:shadow-xl hover:scale-105 transition-colors"
                            >
                                <span className="font-medium text-white">
                                    {user.userName}
                                </span>
                                <span className="text-white">{user.count} Post(s)</span>
                            </div>
                        ))}
                </div>
            </div>
        </aside>
    );
};

export default DiscussionSidebar;