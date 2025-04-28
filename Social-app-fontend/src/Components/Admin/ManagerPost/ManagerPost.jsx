import React, { useEffect, useState } from "react";
import { getAllPostAdmin, handleUpdateStatus } from "../../../Service/postApi";

const ManagerPost = () => {
  const [posts, setPosts] = useState([]);

  const toggleApproval = async (id) => {
    const post = posts.find((p) => p.id === id);
    const isApproved = post?.status === "True";

    const confirmText = isApproved
      ? "Bạn có chắc chắn muốn chặn bài viết này không?"
      : "Bạn có chắc chắn muốn phê duyệt bài này không?";

    const confirmAction = window.confirm(confirmText);
    if (!confirmAction) return;

    const updatedStatus = isApproved ? "False" : "True";

    const data = {
      id: id,
      status: updatedStatus,
    };

    try {
      const response = await handleUpdateStatus(data);
      console.log(response.data);
      fetchData(); // Reload lại dữ liệu
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const toggleVisibility = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              access: post.access === "PUBLIC" ? "PRIVATE" : "PUBLIC",
            }
          : post
      )
    );
  };

  const fetchData = async () => {
    try {
      const response = await getAllPostAdmin();
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Quản lý bài viết</h2>

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <p className="text-gray-500">
                      Tác giả: {post.user?.userFullname}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Ngày đăng: {post.createdAt}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleVisibility(post.id)}
                      className={`px-4 py-2 rounded-lg text-white ${
                        post.access === "PUBLIC"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }`}
                    >
                      {post.access === "PUBLIC" ? "Công khai" : "Riêng tư"}
                    </button>
                    <button
                      onClick={() => toggleApproval(post.id)}
                      className={`px-4 py-2 rounded-lg text-white ${
                        post.status === "True"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {post.status === "True"
                        ? "Đã phê duyệt"
                        : "Chưa phê duyệt"}
                    </button>
                  </div>
                </div>

                {post.media?.map((item) => (
                  <div key={item.id} className="mb-4 flex justify-center">
                    <img
                      src={item.url}
                      alt="Post media"
                      className="max-w-[500px] h-auto rounded-lg object-cover shadow-md"
                    />
                  </div>
                ))}

                {post.video && (
                  <div className="mb-4 flex justify-center">
                    <video
                      controls
                      className="max-w-[500px] rounded-lg shadow-md"
                    >
                      <source src={post.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <p className="text-gray-700 mt-4 p-4 bg-gray-50 rounded-lg">
                  {post.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerPost;
