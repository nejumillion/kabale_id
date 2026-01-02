import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import Footer from '@/components/footer';
import Header from '@/components/header';
import NotFoundComponent from '@/components/not-found';
import { AuthProvider } from '@/context/auth-context';
import { getCurrentUser } from '@/server/auth-context';
import appCss from '../styles.css?url';

const generateHead = () => {
  return {
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Residential ID Card - Official Digital Identity Platform',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  };
};

export const Route = createRootRoute({
  head: generateHead,
  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
  loader: async () => {
    const user = await getCurrentUser();
    return {
      user,
    };
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useLoaderData();
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider user={user}>
          <Header user={user} />
          {children}
          <Footer />
        </AuthProvider>
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Scripts />
      </body>
    </html>
  );
}
