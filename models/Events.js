// import pool from "../db/db.js";

// // Function to get events with image paths
// export const getEvents = async () => {
//     const [rows] = await pool.query('SELECT * FROM events');

//     const eventsWithImages = rows.map(event => ({
//         ...event,
//         // Construct full image URL using BASE_URL and image path from the database
//         image: event.image ? `${process.env.BASE_URL}${event.image}` : null 
//     }));

//     return eventsWithImages;
// };

// // caytegories
// export const getCategories = async () => {
//     const [rows] = await pool.query('SELECT * FROM categories');

//     const categoryWithImages = rows.map(category => ({
//         ...category,
//         // Construct full image URL using BASE_URL and image path from the database
//         image: category.image ? `${process.env.BASE_URL}${category.image}` : null 
//     }));

//     return categoryWithImages;
// };


// // nominees
// export const getNominees = async () => {
//     const [rows] = await pool.query('SELECT * FROM nominees');

//     const NomineeWithImages = rows.map(nominee => ({
//         ...nominee,
//         // Construct full image URL using BASE_URL and image path from the database
//         image: nominee.image ? `${process.env.BASE_URL}${nominee.image}` : null 
//     }));

//     return NomineeWithImages;
// };

// // Assuming you're using a MySQL database and a connection pool named `pool`
// export const getNominee = async (nomineeId) => {
//     const query = 'SELECT * FROM nominees WHERE id = ?'; // Correct SQL query
//     try {
//         const [rows] = await pool.query(query, [nomineeId]); // Use nomineeId here
//         if (rows.length === 0) {
//             throw new Error('Nominee not found');
//         }
//         return rows[0]; // Return the first nominee object
//     } catch (error) {
//         console.error('Error fetching nominee:', error);
//         throw error; // Rethrow the error for handling in the calling function
//     }
// };

// export const getCategory = async (categoryId) => {
//     const query = 'SELECT * FROM categories WHERE id = ?'; // Correct SQL query
//     try {
//         const [rows] = await pool.query(query, [categoryId]); // Use nomineeId here
//         if (rows.length === 0) {
//             throw new Error('category not found');
//         }
//         return rows[0]; // Return the first nominee object
//     } catch (error) {
//         console.error('Error fetching category:', error);
//         throw error; // Rethrow the error for handling in the calling function
//     }
// };

// export const getVotes = async () => {
//     const [rows] = await pool.query('SELECT * FROM votes');

//     const votesWithImages = rows.map(vote => ({
//         ...vote,
//         // Construct full image URL using BASE_URL and image path from the database
//         image: vote.image ? `${process.env.BASE_URL}${vote.image}` : null 
//     }));

//     return votesWithImages;
// };




// getNomineesByCategoryId
export const getNomineesByCategoryId = async (categoryId) => {
    const query = 'SELECT * FROM nominees WHERE category_id = ?'; // Adjust the SQL query to match your database schema
    const [rows] = await pool.query(query, [categoryId]); // Use your database pool/querying method

    return rows; // Return the fetched nominees
};

