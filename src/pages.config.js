import Home from './pages/Home';
import SkinAnalysis from './pages/SkinAnalysis';
import Results from './pages/Results';
import History from './pages/History';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "SkinAnalysis": SkinAnalysis,
    "Results": Results,
    "History": History,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};