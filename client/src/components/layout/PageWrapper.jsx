import Topbar from './Topbar';

export default function PageWrapper({ title, titleHi, children }) {
  return (
    <>
      <Topbar title={title} titleHi={titleHi} />
      <div className="p-4 lg:p-6 space-y-6">
        {children}
      </div>
    </>
  );
}
