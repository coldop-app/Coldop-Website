   import TopBar from '@/components/common/Topbar/Topbar';

   const DaybookScreen = () => {
     return (
       <>
       <TopBar  title="Daybook" isSidebarOpen={false} setIsSidebarOpen={() => {}} />
         <div className="bg-secondary rounded-lg p-6 mt-6">
           <p>Daybook content goes here</p>
         </div>
       </>
     );
   };

   export default DaybookScreen;