import Analysis from './pages/Analysis';
import History from './pages/History';
import Home from './pages/Home';
import Results from './pages/Results';
import SkinAnalysis from './pages/SkinAnalysis';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Shop from './pages/Shop';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analysis": Analysis,
    "History": History,
    "Home": Home,
    "Results": Results,
    "SkinAnalysis": SkinAnalysis,
    "Profile": Profile,
    "Products": Products,
    "Shop": Shop,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};