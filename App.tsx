import React, { useState, useCallback, useRef } from 'react';
import { AppState, LengthSuggestion } from './types';
import { getInitialSuggestions, continueChatStream } from './services/geminiService';
import FileUpload from './components/FileUpload';
import SuggestionReview from './components/SuggestionReview';
import LengthSelection from './components/LengthSelection';
import ArticlePreview from './components/ArticlePreview';
import Loader from './components/Loader';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [error, setError] = useState<string | null>(null);
    
    const [transcript, setTranscript] = useState<string>('');
    const [titles, setTitles] = useState<string[]>([]);
    const [lengthSuggestions, setLengthSuggestions] = useState<LengthSuggestion[]>([]);
    
    const [selectedTitle, setSelectedTitle] = useState<string>('');
    const [selectedLength, setSelectedLength] = useState<number>(0);
    const [referenceUrl, setReferenceUrl] = useState<string>('');
    
    const [blogPost, setBlogPost] = useState<string>('');

    const fullArticleRef = useRef<string>("");

    const handleFileSelect = async (file: File) => {
        setError(null);
        setAppState(AppState.PROCESSING_FILE);
        try {
            const fileText = await file.text();
            setTranscript(fileText);

            const suggestions = await getInitialSuggestions(fileText);
            setTitles(suggestions.titles);
            setLengthSuggestions(suggestions.lengthSuggestions);
            setAppState(AppState.AWAITING_TITLE_APPROVAL);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`AIから提案を取得できませんでした: ${errorMessage}`);
            setAppState(AppState.IDLE);
        }
    };

    const handleTextSubmit = async (text: string) => {
        setError(null);
        setAppState(AppState.PROCESSING_FILE);
        try {
            setTranscript(text);

            const suggestions = await getInitialSuggestions(text);
            setTitles(suggestions.titles);
            setLengthSuggestions(suggestions.lengthSuggestions);
            setAppState(AppState.AWAITING_TITLE_APPROVAL);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`AIから提案を取得できませんでした: ${errorMessage}`);
            setAppState(AppState.IDLE);
        }
    };

    const handleTitleSelect = (title: string) => {
        setSelectedTitle(title);
        setAppState(AppState.AWAITING_LENGTH_SELECTION);
    };

    const handleLengthSelect = (length: number) => {
        setSelectedLength(length);
        setAppState(AppState.AWAITING_REFERENCE_URL);
    };

    const startArticleGeneration = useCallback(async () => {
        if (!selectedTitle || !selectedLength || !transcript) return;
        setAppState(AppState.GENERATING_ARTICLE);
        setError(null);
        fullArticleRef.current = "";

        const referenceText = referenceUrl ? `参考ブログ記事は「${referenceUrl}」です。` : '参考ブログ記事はありません。';
        const lengthText = `目標文字数は約${selectedLength.toLocaleString()}字です。`;
        const fullPrompt = `タイトル「${selectedTitle}」で、${lengthText}${referenceText}

それでは、ルールに従って、このタイトルと文字数に適したブログ記事を執筆してください。`;

        try {
            for await (const chunk of continueChatStream(fullPrompt)) {
                fullArticleRef.current += chunk;
                setBlogPost(fullArticleRef.current);
            }
            setAppState(AppState.COMPLETED);
        } catch (e) {
            console.error(e);
            setError('記事の生成中にエラーが発生しました。');
            setAppState(AppState.ERROR);
        }
    }, [selectedTitle, selectedLength, transcript, referenceUrl]);
    
    const resetApp = () => {
        setAppState(AppState.IDLE);
        setError(null);
        setTranscript('');
        setTitles([]);
        setLengthSuggestions([]);
        setSelectedTitle('');
        setSelectedLength(0);
        setReferenceUrl('');
        setBlogPost('');
        fullArticleRef.current = "";
    };

    const renderContent = () => {
        const showArticlePreviewStates = [
            AppState.GENERATING_ARTICLE,
            AppState.COMPLETED
        ];

        if (showArticlePreviewStates.includes(appState)) {
            return <ArticlePreview
                title={selectedTitle}
                blogPost={blogPost}
                appState={appState}
             />;
        }

        switch (appState) {
            case AppState.IDLE:
                return <FileUpload onFileSelect={handleFileSelect} onTextSubmit={handleTextSubmit} />;
            case AppState.PROCESSING_FILE:
                return <Loader text="テープ起こしを分析し、提案を生成しています..." />;
            case AppState.AWAITING_TITLE_APPROVAL:
                return <SuggestionReview 
                    title="タイトルを選択"
                    description="AIがテープ起こしを元に以下のタイトル案を生成しました。1つ選んで次に進んでください。"
                    suggestions={titles}
                    onSelect={handleTitleSelect}
                    buttonText="タイトルを決定"
                    onReset={resetApp}
                    />;
            case AppState.AWAITING_LENGTH_SELECTION:
                return <LengthSelection
                    title={selectedTitle}
                    lengthSuggestions={lengthSuggestions}
                    onSelect={handleLengthSelect}
                    onReset={resetApp}
                />;
            case AppState.AWAITING_REFERENCE_URL:
                return (
                    <div className="w-full max-w-2xl mx-auto text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">参考記事URL（任意）</h3>
                        <p className="text-gray-600 mb-6">AIが文体の参考にできるよう、参考ブログ記事のURLを入力できます。</p>
                        <input
                            type="url"
                            value={referenceUrl}
                            onChange={(e) => setReferenceUrl(e.target.value)}
                            placeholder="https://example.com/blog/article"
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <button 
                            onClick={startArticleGeneration}
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg">
                            記事執筆を開始
                        </button>
                    </div>
                );
            default:
                return <p>未処理の状態です。</p>;
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center p-4 sm:p-8">
            <header className="w-full max-w-4xl mx-auto mb-6 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <HeaderIcon />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">ささっとnote記事を書くアプリ</h2>
                        <p className="text-sm text-gray-600 mt-1">テープ起こしから自動でnote記事を生成</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    {appState !== AppState.IDLE && (
                        <button 
                            onClick={resetApp}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm shadow-md hover:shadow-lg border border-red-400">
                            🔄 やり直す
                        </button>
                    )}
                    <div className="text-right">
                        <p className="text-xs text-gray-500 leading-tight max-w-48">
                            あなたの言葉をそのまま活かす<br />
                            他のAIアプリとは一線を画す<br />
                            オリジナル性重視の記事生成
                        </p>
                    </div>
                </div>
            </header>
            <main className="w-full max-w-4xl flex-grow flex items-center justify-center">
                {error && <div className="fixed top-24 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg shadow-lg z-50">{error}</div>}
                {renderContent()}
            </main>
        </div>
    );
};

export default App;