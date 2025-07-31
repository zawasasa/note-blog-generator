
import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTextSubmit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['text/plain', 'text/markdown'];
    const allowedExtensions = ['.txt', '.md'];
    
    // ファイルタイプをチェック
    if (allowedTypes.includes(file.type)) {
      return true;
    }
    
    // 拡張子をチェック
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleFileValidation = (file: File) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDFファイルは対応していません。テキストファイル（.txt）またはマークダウンファイル（.md）をご利用ください。');
      return false;
    }
    
    if (!validateFile(file)) {
      alert('対応していないファイル形式です。テキストファイル（.txt）またはマークダウンファイル（.md）をご利用ください。');
      return false;
    }
    
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (handleFileValidation(file)) {
        onFileSelect(file);
      }
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (handleFileValidation(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextSubmit(textInput.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">テープ起こしファイルをアップロード</h3>
        <p className="text-gray-600">あなたが話した内容のテキストファイルを読み込ませて</p>
        <p className="text-gray-600">AIが自動でnote記事を書いてくれます</p>
      </div>
      
      {/* メインのファイルアップロードエリア */}
      <div className="space-y-6">
        {/* ファイルアップロードボタン */}
        <div className="flex justify-center">
          <button
            onClick={handleFileButtonClick}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            ファイルを選択してアップロード
          </button>
        </div>

        {/* またはの区切り */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">または</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* ドラッグ＆ドロップエリア */}
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-48 border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-blue-400 bg-blue-50 shadow-xl transform scale-105' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
              isDragging ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <UploadIcon />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              {isDragging ? 'ファイルをここにドロップ' : 'ドラッグ＆ドロップでファイルをアップロード'}
            </h4>
            <p className="text-sm text-gray-600">
              対応形式: <span className="font-semibold text-blue-600">.txt</span> または <span className="font-semibold text-blue-600">.md</span>
            </p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileSelect} accept=".txt,.md" />
        </label>

        {/* 警告メッセージ */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 flex items-center gap-2 justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            PDFファイルは対応していません
          </p>
        </div>

        {/* テキスト入力オプション */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            {showTextInput ? 'テキスト入力を閉じる' : 'テキストを直接入力する'}
          </button>
        </div>

        {/* テキスト入力エリア */}
        {showTextInput && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 animate-fadeIn">
            <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              テキストを直接入力
            </h4>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="ここにテープ起こしのテキストを貼り付けてください..."
              className="w-full h-32 p-4 border-2 border-green-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              テキストを送信
            </button>
          </div>
        )}
      </div>

      {/* 使い方ガイド */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          使い方
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
            <p className="text-sm text-gray-700">ファイルをアップロード<br/>またはテキストを入力</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
            <p className="text-sm text-gray-700">AIが提案を生成</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
            <p className="text-sm text-gray-700">記事を保存・コピー</p>
          </div>
        </div>
      </div>

      {/* 差別化ポイント */}
      <div className="mt-6 flex justify-center">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100 max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-gray-900">あなたの言葉をそのまま活かす</span>
          </div>
          <p className="text-xs text-gray-600">オリジナル性重視の記事生成</p>
        </div>
      </div>

      {/* 隠しファイル入力 */}
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        onChange={handleFileSelect} 
        accept=".txt,.md" 
      />
    </div>
  );
};

export default FileUpload;
