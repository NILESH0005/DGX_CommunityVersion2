import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const PostCode = () => {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [submittedCode, setSubmittedCode] = useState(null);

    const handlePost = () => {
        // Save the discussion with the code snippet
        setSubmittedCode({ language, code });
        setCode(""); // Clear the textarea after submission
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Post a Code Snippet</h1>
            
            {/* Code Input Area */}
            <textarea
                placeholder="Write your code here..."
                className="border p-2 w-full mb-4 rounded resize-none"
                rows={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            {/* Language Selection */}
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border p-2 rounded mb-4"
            >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
                <option value="bash">Bash</option>

            </select>

            {/* Post Button */}
            <button
                onClick={handlePost}
                className="bg-blue-500 text-white p-2 rounded"
            >
                Post
            </button>

            {/* Render Submitted Code */}
            {submittedCode && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">
                        Submitted Code Snippet:
                    </h2>
                    <SyntaxHighlighter
                        language={submittedCode.language}
                        style={dracula}
                        className="rounded shadow p-2"
                    >
                        {submittedCode.code}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    );
};

export default PostCode;
