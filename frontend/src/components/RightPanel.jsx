import Search from '../components/Search';
import SuggestedUsers from '../components/SuggestedUsers';

const RightPanel = () => {
    return (
        <div className="hidden lg:flex flex-col my-2 mx-2 sticky top-0 left-0 h-screen">
            <Search />
            <SuggestedUsers />
        </div>
    );
};
export default RightPanel;
