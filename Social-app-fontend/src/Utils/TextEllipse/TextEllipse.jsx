import React from "react";

const TextEllipse = ({ username, maxLength = 8 }) => {
    const usernameEllipse = 
        username.length > maxLength
        ? `${username.slice(0, maxLength)}...`
        : username;

    return (
        <p className="text-white text-sm mt-1 truncate"> 
            {usernameEllipse} 
        </p>
    ); 
}

export default TextEllipse;
