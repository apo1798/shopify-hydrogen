// import {
//   // The `useShopQuery` hook makes server-only GraphQL queries to the Storefront API.
//   useShopQuery,
//   // The `flattenConnection` utility takes Shopify storefront relay data
//   // and transforms it into a flat array of objects.
//   flattenConnection,
//   // Import `gql` to parse GraphQL queries.
//   gql,
// } from '@shopify/hydrogen';
// // Import the `Layout` component that defines the structure of the page.
// import Layout from '../components/Layout.server';
// // Import the `ProductList` component that defines the products to display.
// import ProductList from '../components/ProductList';
// //  Import the 'LoadMore' component that you created
// // import LoadMore from '../components/LoadMore.client';
// // Fetch the first three products on the product list page

// // Fetch product data from your storefront by passing in a GraphQL query to the
// // `useShopQuery` server component.
// export default function Index({first = 9}) {
//   const {data} = useShopQuery({
//     query: QUERY,
//     variables: {
//       first,
//     },
//   });

//   // Transform Shopify storefront relay data into
//   // a flat array of objects.
//   const products = flattenConnection(data.products);
//   // Return a list of products.
//   return (
//     <Layout>
//       {/* <LoadMore current={first}> */}
//       <ProductList products={products} />
//       {/* </LoadMore> */}
//     </Layout>
//   );
// }

// // Define the GraphQL query.
// const QUERY = gql`
//   query HomeQuery($first: Int!) {
//     products(first: $first) {
//       edges {
//         node {
//           handle
//           id
//           media(first: 10) {
//             edges {
//               node {
//                 ... on MediaImage {
//                   mediaContentType
//                   image {
//                     id
//                     url
//                     altText
//                     width
//                     height
//                   }
//                 }
//               }
//             }
//           }
//           metafields(first: 3) {
//             edges {
//               node {
//                 id
//                 type
//                 namespace
//                 key
//                 value
//                 createdAt
//                 updatedAt
//                 description
//                 reference {
//                   __typename
//                   ... on MediaImage {
//                     id
//                     mediaContentType
//                     image {
//                       id
//                       url
//                       altText
//                       width
//                       height
//                     }
//                   }
//                 }
//               }
//             }
//           }
//           priceRange {
//             maxVariantPrice {
//               currencyCode
//               amount
//             }
//             minVariantPrice {
//               currencyCode
//               amount
//             }
//           }
//           title
//           variants(first: 250) {
//             edges {
//               node {
//                 id
//                 title
//                 availableForSale
//                 image {
//                   id
//                   url
//                   altText
//                   width
//                   height
//                 }
//                 priceV2 {
//                   currencyCode
//                   amount
//                 }
//                 compareAtPriceV2 {
//                   currencyCode
//                   amount
//                 }
//                 selectedOptions {
//                   name
//                   value
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;

import {
  useShop,
  useShopQuery,
  Link,
  Seo,
  CacheDays,
  useSession,
  useServerAnalytics,
  ShopifyAnalyticsConstants,
  gql,
} from '@shopify/hydrogen';

import Layout from '../components/Layout.server';
import FeaturedCollection from '../components/FeaturedCollection';
import ProductCard from '../components/ProductCard';
import Welcome from '../components/Welcome.server';
import {Suspense} from 'react';

export default function Index() {
  const {countryCode = 'US'} = useSession();

  useServerAnalytics({
    shopify: {
      pageType: ShopifyAnalyticsConstants.pageType.home,
    },
  });

  return (
    <Layout hero={<GradientBackground />}>
      <Suspense fallback={null}>
        <SeoForHomepage />
      </Suspense>
      <div className="relative mb-12">
        <Welcome />
        <Suspense fallback={<BoxFallback />}>
          <FeaturedProductsBox country={countryCode} />
        </Suspense>
        <Suspense fallback={<BoxFallback />}>
          <FeaturedCollectionBox country={countryCode} />
        </Suspense>
      </div>
    </Layout>
  );
}

function SeoForHomepage() {
  const {
    data: {
      shop: {title, description},
    },
  } = useShopQuery({
    query: SEO_QUERY,
    cache: CacheDays(),
    preload: true,
  });

  return (
    <Seo
      type="homepage"
      data={{
        title,
        description,
      }}
    />
  );
}

function BoxFallback() {
  return <div className="bg-white p-12 shadow-xl rounded-xl mb-10 h-40"></div>;
}

function FeaturedProductsBox({country}) {
  const {languageCode} = useShop();

  const {data} = useShopQuery({
    query: QUERY,
    variables: {
      country,
      language: languageCode,
    },
    preload: true,
  });

  const collections = data ? data.collections.nodes : [];
  const featuredProductsCollection = collections[0];
  const featuredProducts = featuredProductsCollection
    ? featuredProductsCollection.products.nodes
    : null;

  return (
    <div className="bg-white p-12 shadow-xl rounded-xl mb-10">
      {featuredProductsCollection ? (
        <>
          <div className="flex justify-between items-center mb-8 text-md font-medium">
            <span className="text-black uppercase">
              {featuredProductsCollection.title}
            </span>
            <span className="hidden md:inline-flex">
              <Link
                to={`/collections/${featuredProductsCollection.handle}`}
                className="text-blue-600 hover:underline"
              >
                Shop all
              </Link>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="md:hidden text-center">
            <Link
              to={`/collections/${featuredProductsCollection.handle}`}
              className="text-blue-600"
            >
              Shop all
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

function FeaturedCollectionBox({country}) {
  const {languageCode} = useShop();

  const {data} = useShopQuery({
    query: QUERY,
    variables: {
      country,
      language: languageCode,
    },
    preload: true,
  });

  const collections = data ? data.collections.nodes : [];
  const featuredCollection =
    collections && collections.length > 1 ? collections[1] : collections[0];

  return <FeaturedCollection collection={featuredCollection} />;
}

function GradientBackground() {
  return (
    <div className="fixed top-0 w-full h-3/5 overflow-hidden">
      <div className="absolute w-full h-full bg-gradient-to-t from-gray-50 z-10" />

      <svg
        viewBox="0 0 960 743"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        className="filter blur-[30px]"
        aria-hidden="true"
      >
        <defs>
          <path fill="#fff" d="M0 0h960v540H0z" id="reuse-0" />
        </defs>
        <g clipPath="url(#a)">
          <use xlinkHref="#reuse-0" />
          <path d="M960 0H0v743h960V0Z" fill="#7CFBEE" />
          <path
            d="M831 380c200.48 0 363-162.521 363-363s-162.52-363-363-363c-200.479 0-363 162.521-363 363s162.521 363 363 363Z"
            fill="#4F98D0"
          />
          <path
            d="M579 759c200.479 0 363-162.521 363-363S779.479 33 579 33 216 195.521 216 396s162.521 363 363 363Z"
            fill="#7CFBEE"
          />
          <path
            d="M178 691c200.479 0 363-162.521 363-363S378.479-35 178-35c-200.4794 0-363 162.521-363 363s162.5206 363 363 363Z"
            fill="#4F98D0"
          />
          <path
            d="M490 414c200.479 0 363-162.521 363-363S690.479-312 490-312 127-149.479 127 51s162.521 363 363 363Z"
            fill="#4F98D0"
          />
          <path
            d="M354 569c200.479 0 363-162.521 363-363 0-200.47937-162.521-363-363-363S-9 5.52063-9 206c0 200.479 162.521 363 363 363Z"
            fill="#7CFBEE"
          />
          <path
            d="M630 532c200.479 0 363-162.521 363-363 0-200.4794-162.521-363-363-363S267-31.4794 267 169c0 200.479 162.521 363 363 363Z"
            fill="#4F98D0"
          />
        </g>
        <path fill="#fff" d="M0 540h960v203H0z" />
        <defs>
          <clipPath id="a">
            <use xlinkHref="#reuse-0" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

const SEO_QUERY = gql`
  query homeShopInfo {
    shop {
      description
    }
  }
`;

const QUERY = gql`
  query indexContent($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 2) {
      nodes {
        handle
        id
        title
        image {
          id
          url
          altText
          width
          height
        }
        products(first: 10) {
          nodes {
            handle
            id
            title
            variants(first: 1) {
              nodes {
                id
                title
                availableForSale
                image {
                  id
                  url
                  altText
                  width
                  height
                }
                priceV2 {
                  currencyCode
                  amount
                }
                compareAtPriceV2 {
                  currencyCode
                  amount
                }
              }
            }
          }
        }
      }
    }
    shop {
      name
    }
  }
`;
