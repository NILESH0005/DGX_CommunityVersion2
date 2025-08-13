import React, { useContext, useRef, useEffect } from 'react';
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TbUserSquareRounded } from "react-icons/tb";
import Swal from "sweetalert2";
import ApiContext from '../context/ApiContext';
import JoditEditor from "jodit-react";

const BlogModal = ({ blog, closeModal, updateBlogState }) => {
    const { title, image, author, published_date, content, Status, BlogID, UserName } = blog || {};
    const { fetchData, userToken, user } = useContext(ApiContext);
    const modalRef = useRef(null);
    const editorRef = useRef(null);

    // Handle click outside to close modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                closeModal();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeModal]);

    const updateBlogStatus = async (blogId, Status, remark = "") => {
        const endpoint = `blog/updateBlog/${blogId}`;
        const method = "POST";
        const headers = {
            "Content-Type": "application/json",
            "auth-token": userToken,
        };

        const body = { Status, remark };

        try {
            const result = await fetchData(endpoint, method, body, headers);

            if (result.success) {
                Swal.fire({
                    title: "Success!",
                    text: `Blog ${Status}ed successfully!`,
                    icon: "success",
                    confirmButtonText: "OK",
                });

                if (typeof updateBlogState === 'function') {
                    updateBlogState(blogId, Status);
                } else {
                    console.warn('updateBlogState is not a function');
                }
                closeModal();
            } else {
                Swal.fire({
                    title: "Error!",
                    text: `Failed to ${Status} blog: ${result.message}`,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: `Error ${Status}ing blog: ${error.message}`,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleAction = (status) => {
        if (status === "reject") {
            Swal.fire({
                title: "Reject Blog",
                input: "text",
                inputLabel: "Enter reason for rejection",
                inputPlaceholder: "Provide a reason for rejection...",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Reject",
                inputValidator: (value) => {
                    if (!value) {
                        return "You need to provide a reason!";
                    }
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    updateBlogStatus(BlogID, "reject", result.value);
                }
            });
        } else if (status === "delete") {
            Swal.fire({
                title: `Are you sure?`,
                text: `You are about to delete this blog.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: `OK `,
            }).then((result) => {
                if (result.isConfirmed) {
                    updateBlogStatus(BlogID, "delete");
                }
            });
        } else {
            Swal.fire({
                title: `Are you sure?`,
                text: `You are about to ${status} this blog.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: status === "approve" ? "#28a745" : "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: `Yes, ${status}!`,
            }).then((result) => {
                if (result.isConfirmed) {
                    updateBlogStatus(BlogID, status);
                }
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-green-600";
            case "Rejected":
                return "text-red-600";
            case "Pending":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 overflow-hidden">
            <div 
                ref={modalRef}
                className="bg-white w-full h-full max-w-full flex flex-col overflow-hidden"
            >
                {/* Header - Updated to show UserName */}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <div className="flex items-center gap-2">
                            <span className={`font-medium ${getStatusColor(Status)}`}>
                                {Status || "Pending"}
                            </span>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-600">{UserName || author}</span>
                        </div>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={closeModal}
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xl" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-grow overflow-y-auto p-6">
                    {image && (
                        <div className="w-full mb-6 flex justify-center">
                            <img 
                                className="max-w-full max-h-96 object-contain rounded" 
                                src={image} 
                                alt={title} 
                            />
                        </div>
                    )}

                    <div className="flex flex-col items-center mb-6">
                        <div className="flex items-center gap-2">
                            <TbUserSquareRounded className="text-gray-600 text-2xl" />
                            <span className="text-gray-600">{UserName || author}</span>
                        </div>
                        {published_date && (
                            <p className="text-gray-500">{published_date}</p>
                        )}
                    </div>

                    <div className="prose max-w-none">
                        <JoditEditor
                            ref={editorRef}
                            value={content}
                            config={{
                                readonly: true,
                                toolbar: false,
                                statusbar: false,
                                buttons: [],
                                iframe: true,
                                height: 'auto',
                                width: 'auto',
                                removeButtons: [],
                                showXPathInStatusbar: false,
                                showCharsCounter: false,
                                showWordsCounter: false,
                                disablePlugins: 'paste,sticky,drag-and-drop,drag-and-drop-element',
                            }}
                            tabIndex={1}
                            onBlur={() => {}}
                            onChange={() => {}}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t sticky bottom-0 bg-white flex justify-between">
                    <div className="flex gap-4">
                        {(user.isAdmin == '1') && Status === "Pending" && (
                            <>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                    onClick={() => handleAction("approve")}
                                >
                                    Approve
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                    onClick={() => handleAction("reject")}
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {(user.isAdmin == '1') && (Status === "Approved" || Status === "Rejected") && (
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                onClick={() => handleAction("delete")}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={closeModal} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogModal;