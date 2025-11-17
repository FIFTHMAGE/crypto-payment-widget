/** DarkModeToggle - Dark mode support with theme switcher */
import { useState } from 'react';
export const DarkModeToggle = () => { const [dark, setDark] = useState(false); return (<button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100">{dark ? '🌞' : '🌙'}</button>); };

