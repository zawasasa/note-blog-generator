import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppState } from '../types';
import Loader from './Loader';
import { DownloadIcon, CopyIcon } from './icons';

interface ArticlePreviewProps {
  title: string;
  blogPost: string;
  appState: AppState;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ title, blogPost, appState }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleDownloadMarkdown = async () => {
    setIsDownloading(true);
    try {
      const markdownContent = `# ${title}\n\n${blogPost}`;
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードに失敗しました。');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsCopying(true);
    try {
      const markdownContent = `# ${title}\n\n${blogPost}`;
      await navigator.clipboard.writeText(markdownContent);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      console.error('コピーエラー:', error);
      alert('コピーに失敗しました。');
    } finally {
      setIsCopying(false);
    }
  };

  const renderActionPanel = () => {
    switch (appState) {
        case AppState.GENERATING_ARTICLE:
            return <div className="mt-6"><Loader text="記事全体を生成しています... しばらくお待ちください。" /></div>;
        case AppState.COMPLETED:
            return (
                 <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="font-semibold text-green-800 mb-3">記事の生成が完了しました！</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                            onClick={handleDownloadMarkdown}
                            disabled={isDownloading}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
                        >
                            {isDownloading ? (
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            ) : (
                                <DownloadIcon />
                            )}
                            MDファイルで保存
                        </button>
                        <button
                            onClick={handleCopyToClipboard}
                            disabled={isCopying}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
                        >
                            {isCopying ? (
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            ) : (
                                <CopyIcon />
                            )}
                            全文コピー
                        </button>
                    </div>
                    {showCopySuccess && (
                        <div className="mt-2 text-xs text-green-600">
                            ✓ クリップボードにコピーしました
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">{title}</h3>
        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-600 prose-code:text-blue-600 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // コードブロックのスタイリング
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono text-xs" {...props}>
                    {children}
                  </code>
                );
              },
              // 引用ブロックのスタイリング
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-3 italic text-gray-600 bg-blue-50 py-2 rounded-r">
                  {children}
                </blockquote>
              ),
              // 見出しのスタイリング
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-900 mb-3 mt-6 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-gray-900 mb-2 mt-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold text-gray-900 mb-2 mt-3">
                  {children}
                </h3>
              ),
              // 段落のスタイリング（空行を適切に処理）
              p: ({ children }) => (
                <p className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {children}
                </p>
              ),
              // リストのスタイリング
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-gray-700 mb-3 space-y-1">
                  {children}
                </ol>
              ),
              // リンクのスタイリング
              a: ({ href, children }) => (
                <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {blogPost}
          </ReactMarkdown>
        </div>
        
        {renderActionPanel()}
      </div>
    </div>
  );
};

export default ArticlePreview;