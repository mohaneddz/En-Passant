export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#333] text-gray-400 text-sm py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Club Name */}
        <div>
          <p className="text-white font-semibold">EN PASSANT</p>
          <p className="text-xs text-gray-500">Official Tournament Platform</p>
        </div>

        {/* Dev Team */}
        <div className="text-right">
          <p className="text-xs">© 2025 ESCC Dev Team</p>
          <p className="text-xs text-gray-600">Built with passion :)</p>
        </div>
      </div>
    </footer>
  );
}