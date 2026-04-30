const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full">
      <div className="mx-auto flex min-h-screen w-full items-start justify-center overflow-y-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
