const fs = require('fs');

let sidebar = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

if (!sidebar.includes('hotelNameState')) {
  // Inject state and effect
  sidebar = sidebar.replace(
    'export default function Sidebar() {',
    `export default function Sidebar() {
  const [hotelNameState, setHotelNameState] = useState(localStorage.getItem('hotelName') || null);
  const [hotelLogoState, setHotelLogoState] = useState(localStorage.getItem('hotelLogo') || null);

  useEffect(() => {
    const handleStorage = () => {
      setHotelNameState(localStorage.getItem('hotelName') || null);
      setHotelLogoState(localStorage.getItem('hotelLogo') || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);`
  );

  // Replace Logo HTML
  sidebar = sidebar.replace(
    /\{\/\* Logo \*\/\}\n\s*<div className="h-16 flex items-center justify-center border-b border-transparent overflow-hidden mt-2">\n\s*<h1 className="font-bold tracking-wide text-gray-800 whitespace-nowrap transition-all duration-300">[\s\S]*?<\/h1>\n\s*<\/div>/,
    `{/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-transparent overflow-hidden mt-2 px-2 gap-2">
        {hotelLogoState && (
          <img src={hotelLogoState} alt="Logo" className={\`object-contain transition-all duration-300 \${isOpen ? 'w-8 h-8' : 'w-7 h-7'}\`} />
        )}
        <h1 className="font-bold tracking-wide text-gray-800 whitespace-nowrap transition-all duration-300">
          {isOpen ? (
            <span className="text-xl sm:text-2xl flex items-center">
              {hotelNameState ? (
                <>
                  {hotelNameState.split(' ')[0]}<span className="text-[#1b7f43] ml-1">{hotelNameState.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Hotel<span className="text-[#1b7f43]">Admin</span></>
              )}
            </span>
          ) : (
            !hotelLogoState && (
              <span className="text-xl text-[#1b7f43]">
                HA
              </span>
            )
          )}
        </h1>
      </div>`
  );

  fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', sidebar, 'utf8');
}
