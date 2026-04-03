type Props = {
  icon: React.ReactNode;
  onClick: () => void;
  activated?: boolean;

};

export function IconButton({ icon, onClick, activated }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center
        w-10 h-10 rounded-xl
        transition-all duration-200
        border

        ${activated 
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105" 
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:scale-105"}
      `}
    >
      {icon}
    </button>
  );
}