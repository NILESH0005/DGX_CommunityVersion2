import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Load external libraries if not already loaded
const loadExternalLibraries = () => {
  return new Promise((resolve) => {
    let scriptsToLoad = 0;
    let scriptsLoaded = 0;

    const checkComplete = () => {
      scriptsLoaded++;
      if (scriptsLoaded === scriptsToLoad) {
        resolve();
      }
    };

    // Load marked.js for markdown parsing
    if (!window.marked) {
      scriptsToLoad++;
      const markedScript = document.createElement('script');
      markedScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js';
      markedScript.onload = checkComplete;
      document.head.appendChild(markedScript);
    }

    // Load highlight.js for syntax highlighting
    if (!window.hljs) {
      scriptsToLoad++;
      const hljsScript = document.createElement('script');
      hljsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
      hljsScript.onload = () => {
        // Load CSS for highlight.js
        const hljsCSS = document.createElement('link');
        hljsCSS.rel = 'stylesheet';
        hljsCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
        document.head.appendChild(hljsCSS);
        checkComplete();
      };
      document.head.appendChild(hljsScript);
    }

    if (scriptsToLoad === 0) {
      resolve();
    }
  });
};

const FileViewer = ({ fileUrl, submoduleName, fileType, filesName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [notebookContent, setNotebookContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);

  const fileExtension = fileUrl?.split('.').pop()?.toLowerCase() || '';
  const fileName = filesName || fileUrl?.split('/').pop() || 'file';

  useEffect(() => {
    loadExternalLibraries().then(() => {
      setLibrariesLoaded(true);
    });
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLinkClick = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const renderDownloadButton = () => (
    <button
      onClick={handleDownload}
      className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors z-10"
    >
      Download File
    </button>
  );

  const renderSubmoduleHeader = () => (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">{submoduleName}</h2>
    </div>
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. The file may be corrupted or invalid.');
  };

  const renderNotebook = (notebook) => {
    return (
      <div className="notebook-container p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{notebook.metadata?.name || 'Jupyter Notebook'}</h2>
        {notebook.cells.map((cell, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded ${cell.cell_type === 'code' ? 'bg-gray-50' : 'bg-white'}`}
          >
            {cell.cell_type === 'code' ? (
              <>
                <div className="flex items-center bg-gray-200 px-2 py-1 rounded-t">
                  <span className="text-xs font-mono text-gray-600">In [{cell.execution_count || ' '}]:</span>
                </div>
                <pre className="p-2 bg-gray-100 text-gray-800 rounded-b overflow-x-auto">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: window.hljs ? window.hljs.highlight(cell.source.join(''), { language: 'python' }).value : cell.source.join('')
                    }}
                  />
                </pre>
                {cell.outputs?.length > 0 && (
                  <div className="mt-2 p-2 bg-white border rounded">
                    <div className="text-xs font-mono text-gray-500 mb-1">Out [{cell.execution_count || ' '}]:</div>
                    {cell.outputs.map((output, i) => (
                      <div key={i} className="font-mono text-sm">
                        {output.output_type === 'stream' ? (
                          <pre className="whitespace-pre-wrap">
                            {output.text ? (Array.isArray(output.text) ? output.text.join('') : output.text) : ''}
                          </pre>
                        ) : output.output_type === 'execute_result' || output.output_type === 'display_data' ? (
                          output.data?.['text/html'] ? (
                            <div dangerouslySetInnerHTML={{
                              __html: Array.isArray(output.data['text/html'])
                                ? output.data['text/html'].join('')
                                : output.data['text/html']
                            }} />
                          ) : output.data?.['image/png'] ? (
                            <img
                              src={`data:image/png;base64,${output.data['image/png']}`}
                              alt="Output"
                              className="max-w-full h-auto"
                            />
                          ) : (
                            output.data?.['text/plain']?.join('\n') || ''
                          )
                        ) : output.output_type === 'error' ? (
                          <div className="text-red-600">
                            <div className="font-bold">{output.ename}: {output.evalue}</div>
                            {output.traceback && (
                              <pre className="text-xs mt-1 whitespace-pre-wrap">
                                {output.traceback.join('\n')}
                              </pre>
                            )}
                          </div>
                        ) : (
                          output.data?.['text/plain']?.join('\n') || output.text?.join('\n') || ''
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="prose max-w-none">
                {cell.source.join('') ? (
                  window.marked ? (
                    <div dangerouslySetInnerHTML={{
                      __html: window.marked.parse(cell.source.join(''))
                    }} />
                  ) : (
                    cell.source.join('').split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))
                  )
                ) : (
                  <p className="text-gray-400 italic">Empty markdown cell</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Handle Jupyter Notebook files
  useEffect(() => {
    if (fileExtension === 'ipynb' && librariesLoaded) {
      const loadNotebook = async () => {
        setLoading(true);
        setError(null);
        try {
          if (!fileUrl.startsWith('http://localhost') && !fileUrl.startsWith('file://')) {
            return;
          }

          // Fallback for local files
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error('Failed to fetch notebook');
          const notebook = await response.json();
          setNotebookContent(renderNotebook(notebook));
        } catch (err) {
          console.error('Error loading notebook:', err);
          setError('Could not load notebook. ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      loadNotebook();
    }
  }, [fileUrl, fileExtension, librariesLoaded]);

  // Handle link file type
  if (fileType === 'link') {
    return (
      <div className="relative flex flex-col items-center justify-center p-8 min-h-[400px]">
        {renderDownloadButton()}
        {renderSubmoduleHeader()}
        <div className="flex flex-col items-center space-y-6">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">External Link</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Click the button below to visit the link in a new tab
          </p>
          <button
            onClick={handleLinkClick}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <span>🌐</span>
            <span>Visit Link</span>
            <span>↗</span>
          </button>
          <div className="mt-4 p-3 bg-gray-100 rounded-lg max-w-md break-all">
            <p className="text-sm text-gray-600">
              <strong>URL:</strong> {fileUrl}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle image files
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension)) {
    return (
      <div className="relative flex flex-col items-center">
        {renderDownloadButton()}
        {renderSubmoduleHeader()}
        <div className="max-w-full max-h-[80vh] overflow-auto">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
            onError={() => setIframeKey(prev => prev + 1)}
          />
        </div>
      </div>
    );
  }

  // Handle PDF files
  if (fileExtension === 'pdf') {
    return (
      <div className="relative w-full flex flex-col items-center">
        {renderDownloadButton()}
        {renderSubmoduleHeader()}
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
          {pdfError ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">Error loading PDF</div>
            </div>
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
              error={
                <div className="p-8 text-center text-red-500">
                  Failed to load PDF document
                </div>
              }
            >
              <div className="overflow-y-auto max-h-[80vh]">
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 border-b border-gray-200 last:border-b-0">
                    <Page
                      pageNumber={index + 1}
                      width={800}
                      renderTextLayer={false}
                      loading={
                        <div className="flex justify-center items-center h-64">
                          Loading page {index + 1}...
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            </Document>
          )}
        </div>
      </div>
    );
  }

  // Handle Office files
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)) {
    return (
      <div className="relative w-full h-full flex flex-col">
        {renderDownloadButton()}
        {renderSubmoduleHeader()}
        <div className="flex-1">
          <iframe
            key={iframeKey}
            title="Office viewer"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            width="100%"
            height="100%"
            frameBorder="0"
            className="border rounded-lg"
            onError={() => setIframeKey(prev => prev + 1)}
          />
        </div>
      </div>
    );
  }

  // Handle Jupyter Notebook files (.ipynb)
  // if (fileExtension === 'ipynb') {
  //   if (!fileUrl.startsWith('http://localhost') && !fileUrl.startsWith('file://')) {
  //     return (
  //       <div className="relative w-full h-full flex flex-col">
  //         {renderDownloadButton()}
  //         {renderSubmoduleHeader()}
  //         <div className="flex-1">
  //           <iframe
  //             key={iframeKey}
  //             src={`https://nbviewer.org/url/${encodeURIComponent(fileUrl)}`}
  //             width="100%"
  //             height="100%"
  //             title="Jupyter Notebook Viewer"
  //             className="border rounded-lg"
  //             onError={() => setIframeKey(prev => prev + 1)}
  //           />
  //         </div>
  //       </div>
  //     );
  //   }

  //   // Enhanced local notebook rendering
  //   return (
  //     <div className="relative w-full h-full flex flex-col p-4 overflow-auto">
  //       {renderDownloadButton()}
  //       {renderSubmoduleHeader()}
  //       {loading ? (
  //         <div className="flex justify-center items-center h-64">
  //           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //         </div>
  //       ) : error ? (
  //         <div className="text-center p-8">
  //           <div className="text-red-500 mb-4">{error}</div>
  //         </div>
  //       ) : (
  //         <>
  //           {notebookContent}
  //         </>
  //       )}
  //     </div>
  //   );
  // }

  // Handle Jupyter Notebook files (.ipynb)
if (fileExtension === 'ipynb') {
  // For deployed environments, use a different approach
  if (!fileUrl.startsWith('http://localhost') && !fileUrl.startsWith('file://')) {
    return (
      <div className="relative w-full h-full flex flex-col">
        {renderDownloadButton()}
        {renderSubmoduleHeader()}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download Notebook
                </button>
              </div>
            ) : notebookContent ? (
              notebookContent
            ) : (
              <div className="text-center p-8">
                <button 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch(fileUrl);
                      if (!response.ok) throw new Error('Failed to fetch notebook');
                      const notebook = await response.json();
                      setNotebookContent(renderNotebook(notebook));
                    } catch (err) {
                      setError('Could not load notebook. ' + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Load Notebook Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Local notebook rendering remains the same
  return (
    <div className="relative w-full h-full flex flex-col p-4 overflow-auto">
      {renderDownloadButton()}
      {renderSubmoduleHeader()}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">{error}</div>
        </div>
      ) : (
        <>
          {notebookContent}
        </>
      )}
    </div>
  );
}
  // Handle CSV files
  if (fileExtension === 'csv') {
    return (
      <div className="relative w-full h-full flex flex-col">
        {renderDownloadButton()}
        {renderSubmoduleHeader()}
        <iframe
          key={iframeKey}
          src={`https://docs.google.com/spreadsheets/d/e/2PACX-1vR9xX9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ9ZQ/pubhtml?gid=0&single=true&output=csv&url=${encodeURIComponent(fileUrl)}`}
          width="100%"
          height="100%"
          title="CSV Viewer"
          className="border rounded-lg"
          onError={() => setIframeKey(prev => prev + 1)}
        />
      </div>
    );
  }

  // Default for unsupported files
  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      {renderDownloadButton()}
      {renderSubmoduleHeader()}
      <div className="text-6xl mb-4">📁</div>
      <p className="text-gray-500 mb-6">This file type cannot be previewed</p>
    </div>
  );
};

export default FileViewer;