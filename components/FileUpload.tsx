
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTextSubmit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (handleFileValidation(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextSubmit(textInput.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">テープ起こしファイルをアップロード</h3>
        <p className="text-xs text-gray-500">あなたが話した内容のテキストファイルを読み込ませて</p>
        <p className="text-xs text-gray-500">AIが自動でnote記事を書いてくれます</p>
      </div>
      
      {/* 区切り線 */}
      <div className="mb-6">
        <hr className="border-gray-200" />
      </div>
      
      {/* 入力方法の選択 */}
      <div className="mb-6">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setInputMethod('file')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMethod === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ファイルをアップロード
          </button>
          <button
            onClick={() => setInputMethod('text')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMethod === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            テキストを直接入力
          </button>
        </div>
      </div>

      {/* ファイルアップロード */}
      {inputMethod === 'file' && (
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 transition-all duration-300 ${isDragging ? 'border-blue-400 bg-blue-50 shadow-lg' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-semibold text-blue-600">クリックしてアップロード</span> またはドラッグ＆ドロップ
            </p>
            <p className="text-xs text-gray-500">TXT または MDファイルのみ</p>
            <p className="text-xs text-red-500 mt-1">※ PDFファイルは対応していません</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleChange} accept=".txt,.md" />
        </label>
      )}

      {/* テキスト直接入力 */}
      {inputMethod === 'text' && (
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="ここにテープ起こしのテキストを貼り付けてください..."
            className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            テキストを送信
          </button>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">使い方</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
          <div className="text-center">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-xs">1</div>
            <p>テープ起こしファイルを<br />アップロード</p>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-xs">2</div>
            <p>AIがタイトルと文字数を<br />提案</p>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-xs">3</div>
            <p>MDファイルで保存または<br />noteエディタに貼り付け</p>
          </div>
        </div>
      </div>

      {/* 差別化ポイントのSVG */}
      <div className="mt-4 flex justify-center">
        <svg width="200" height="40" viewBox="0 0 200 40" className="opacity-60">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#3B82F6',stopOpacity:0.3}} />
              <stop offset="100%" style={{stopColor:'#10B981',stopOpacity:0.3}} />
            </linearGradient>
          </defs>
          <rect width="200" height="40" fill="url(#grad1)" rx="8" ry="8"/>
          <text x="100" y="15" textAnchor="middle" className="text-xs fill-gray-600 font-medium">あなたの言葉をそのまま活かす</text>
          <text x="100" y="28" textAnchor="middle" className="text-xs fill-gray-600 font-medium">オリジナル性重視の記事生成</text>
        </svg>
      </div>
    </div>
  );
};

export default FileUpload;
