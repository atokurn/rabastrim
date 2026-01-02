import { X } from "lucide-react";

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (provider: 'google' | 'telegram') => void;
}

export function AuthDialog({ isOpen, onClose, onLogin }: AuthDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#1f2126] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Masuk ke Akun</h2>
                    <p className="text-gray-400 text-sm mb-8">
                        Simpan riwayat tontonan dan daftar favoritmu secara permanen.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => onLogin('google')}
                            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            Lanjutkan dengan Google
                        </button>

                        <button
                            onClick={() => onLogin('telegram')}
                            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#29b6f6] text-white font-semibold rounded-lg hover:bg-[#039be5] transition-colors"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            Lanjutkan dengan Telegram
                        </button>
                    </div>

                    <p className="text-gray-500 text-xs mt-6">
                        Dengan melanjutkan, kamu menyetujui Syarat dan Ketentuan kami.
                    </p>
                </div>
            </div>
        </div>
    );
}
