const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full ${sizeClasses[size]} relative z-10 my-4`}>
          <div className="bg-white px-3 sm:px-4 md:px-6 pt-4 sm:pt-5 pb-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-3 sm:mb-4 sticky top-0 bg-white pb-2 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 border-b border-gray-100">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 pr-2">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl flex-shrink-0 -mt-1 leading-none"
              >
                &times;
              </button>
            </div>
            <div className="mt-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
