
import React from 'react';

interface HtmlRendererProps {
  htmlContent: string;
  title: string;
  aspectRatio?: string;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent, title, aspectRatio = '16/9' }) => {
  // Add a wrapper to ensure the content is centered and scaled if it's a fixed size like 1920x1080
  const wrappedHtml = `
    <html>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
          body { margin: 0; display: flex; justify-content: center; align-items: center; background-color: transparent; }
          .scaler { transform-origin: top left; }
        </style>
      </head>
      <body>
        <div class="scaler">
          ${htmlContent}
        </div>
        <script>
          const scaler = document.querySelector('.scaler');
          const content = scaler.firstChild;
          function resize() {
            if (content && content.style && content.style.width && content.style.height) {
              const contentWidth = parseInt(content.style.width, 10);
              const contentHeight = parseInt(content.style.height, 10);
              const scale = Math.min(window.innerWidth / contentWidth, window.innerHeight / contentHeight);
              scaler.style.transform = 'scale(' + scale + ')';
            }
          }
          window.addEventListener('resize', resize);
          // Call resize once after content is loaded
          const observer = new MutationObserver(() => {
            if (document.body.contains(scaler)) {
              resize();
              observer.disconnect();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        </script>
      </body>
    </html>
  `;

  return (
    <div 
        className="w-full bg-gray-700 rounded-lg overflow-hidden border border-gray-600"
        style={{ aspectRatio: aspectRatio }}
    >
      <iframe
        srcDoc={wrappedHtml}
        title={title}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default HtmlRenderer;