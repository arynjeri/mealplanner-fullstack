export default function Card({ title, tags, image, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {image && (
        <img src={image} alt={title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {tags?.map((tag, idx) => (
            <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {tag}
            </span>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}