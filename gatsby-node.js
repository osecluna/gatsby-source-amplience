/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.com/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */
 exports.onPreInit = () => console.log("Loaded gatsby-starter-plugin")
 
require ('dotenv').config({
    path: '../source-plugin/.env',
})

const ContentClient = require('dc-delivery-sdk-js').ContentClient;
const client = new ContentClient({
    hubName: `${process.env.HUB_NAME}`,
    apiKey: `${process.env.API_KEY}`
});

// constants for your GraphQL node types
const BLOGPOST_NODE_TYPE = `BlogPost`;
const BANNER_NODE_TYPE = `HomeBanner`;

exports.sourceNodes = async({
    actions,
    createNodeId,
    createContentDigest,
}) => {
    
    const filterBy = await client
    .filterByContentType('https://schema-examples.com/blogpost-filter-and-sort')
    .sortBy('default', 'DESC')
    .request({
        format: 'inlined',
        depth: 'all',
    });
    console.log(filterBy);
    filterBy.responses.forEach(filterItem => {
        console.log(JSON.stringify(filterItem.content));
        actions.createNode({
            ...filterItem.content,
            id: createNodeId(`${BLOGPOST_NODE_TYPE}-${filterItem.content._meta.deliveryId}`),
            parent: null,
            children:[],
            internal: {
                type: BLOGPOST_NODE_TYPE,
                content: JSON.stringify(filterItem.content),
                contentDigest: createContentDigest(filterItem.content)
            },
        })
        
    })

    const slot = 'homepage-banner-slot';
    client
    .getContentItemByKey(slot)
    .then((slotContent) => {
        console.log(JSON.stringify(slotContent.body));
        actions.createNode({
            ...slotContent.body.content,
            id: createNodeId(`${BANNER_NODE_TYPE}-${slotContent.body._meta.deliveryId}`),
            parent: null,
            children:[],
            internal: {
                type: BANNER_NODE_TYPE,
                //content: JSON.stringify(slotContent.body.content),
                contentDigest: createContentDigest(slotContent.body.content)
            }
        })
    })
    .catch((error) => {
        console.log('content not found', error);
    });
}

