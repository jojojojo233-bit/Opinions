interface CategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  'All',
  'Politics',
  'Sports',
  'Technology',
  'Entertainment',
  'Finance',
  'Science',
  'Gaming'
];

export function Categories({ selectedCategory, onSelectCategory }: CategoriesProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
