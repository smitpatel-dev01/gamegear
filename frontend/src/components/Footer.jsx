import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-bg-card border-t border-slate-800 px-6 lg:px-20 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">GG</div>
              <span className="text-white text-xl font-bold">Game<span className="text-primary">Gear</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The ultimate destination for gamers seeking high-performance peripherals to dominate the competition.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5">
              {["Mouse", "Keyboard", "Headset", "Monitor", "Controller"].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="text-slate-400 hover:text-primary text-sm transition-colors">
                    {cat}s
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-slate-400 text-sm">
              {["Contact Us", "Warranty", "Shipping", "Returns", "FAQs"].map((item) => (
                <li key={item}><span className="hover:text-primary cursor-pointer transition-colors">{item}</span></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Get early access to drops and exclusive deals.</p>
            <div className="flex gap-2">
              <input placeholder="Your email" className="input-field text-sm flex-1 py-2" />
              <button className="btn-primary text-sm py-2 px-4">Join</button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">© 2026 GameGear Peripherals. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
