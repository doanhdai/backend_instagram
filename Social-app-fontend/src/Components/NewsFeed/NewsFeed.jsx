import React from "react";
import NewsFeedCart from "../../Components/NewsFeed/NewsFeedCart/NewsFeedCart";
const NewsFeed = () => {
    return (
        <div className="md:max-w-[70vw] sm:max-w-full w-full min-h-screen
            flex justify-center my-3 bg-black">
            {/* NewsFeed section */}
            <NewsFeedCart />
        </div>
    );
};

export default NewsFeed