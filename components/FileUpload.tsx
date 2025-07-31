
import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTextSubmit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState('');
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">テープ起こしファイルをアップロード</h3>
        <p className="text-gray-600">あなたが話した内容のテキストファイルを読み込ませて</p>
        <p className="text-gray-600">AIが自動でnote記事を書いてくれます</p>
      </div>
      
      {/* 左右分割レイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 左側: ファイルアップロード */}
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-blue-900 mb-2">ファイルをアップロード</h4>
            <p className="text-sm text-blue-700">テキストファイル（.txt/.md）をアップロード</p>
          </div>

          {/* ファイルアップロードボタン */}
          <div className="mb-4">
            <button
              onClick={handleFileButtonClick}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              ファイルを選択してアップロード
            </button>
          </div>

          {/* またはの区切り */}
          <div className="flex items-center mb-4">
            <div className="flex-1 border-t border-blue-300"></div>
            <span className="px-4 text-sm text-blue-600 font-medium">または</span>
            <div className="flex-1 border-t border-blue-300"></div>
          </div>

          {/* ドラッグ＆ドロップエリア */}
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-32 border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              isDragging 
                ? 'border-blue-400 bg-blue-100 shadow-xl transform scale-105' 
                : 'border-blue-300 hover:border-blue-400 hover:bg-blue-100 hover:shadow-lg'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center p-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                isDragging ? 'bg-blue-200' : 'bg-blue-100'
              }`}>
                <UploadIcon />
              </div>
              <h5 className="text-sm font-semibold text-blue-900 mb-1">
                {isDragging ? 'ファイルをここにドロップ' : 'ドラッグ＆ドロップ'}
              </h5>
              <p className="text-xs text-blue-700">
                対応: <span className="font-semibold">.txt</span> または <span className="font-semibold">.md</span>
              </p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileSelect} accept=".txt,.md" />
          </label>

          {/* ファイルアップロードの利点 */}
          <div className="mt-4 bg-blue-100 rounded-lg p-3">
            <h6 className="text-xs font-semibold text-blue-900 mb-2">📁 ファイルアップロードの利点</h6>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 長いテキストも簡単にアップロード</li>
              <li>• ファイル形式を自動判定</li>
              <li>• ドラッグ＆ドロップで簡単操作</li>
            </ul>
          </div>
        </div>

        {/* 右側: テキスト直接入力 */}
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-green-900 mb-2">テキストを直接入力</h4>
            <p className="text-sm text-green-700">テープ起こしのテキストを直接貼り付け</p>
          </div>

          {/* テキスト入力エリア */}
          <div className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="ここにテープ起こしのテキストを貼り付けてください..."
              className="w-full h-32 p-4 border-2 border-green-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              テキストを送信して記事生成を開始
            </button>
          </div>

          {/* テキスト入力の利点 */}
          <div className="mt-4 bg-green-100 rounded-lg p-3">
            <h6 className="text-xs font-semibold text-green-900 mb-2">✏️ テキスト直接入力の利点</h6>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• 短いテキストに最適</li>
              <li>• リアルタイムで編集可能</li>
              <li>• ファイル準備不要</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 警告メッセージ */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 flex items-center gap-2 justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          PDFファイルは対応していません
        </p>
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
