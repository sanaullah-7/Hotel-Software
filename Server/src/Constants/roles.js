// Object ko freeze kar do taake uski properties accidentally change na ho saken.
export const ROLES = Object.freeze({
    SUPER_ADMIN: "SUPER_ADMIN" ,
    HOTEL_OWNER: "HOTEL_OWNER" ,  
    HOTEL_MANAGER: "HOTEL_MANAGER" ,
    RECEPTIONIST: "RECEPTIONIST",
    TRAVELLER: "TRAVELLER",
})