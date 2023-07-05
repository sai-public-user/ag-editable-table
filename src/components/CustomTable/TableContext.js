import React, { createContext } from "react";


export const TableContext = createContext({});

const TableContextProvider = ({ children, ...rest }) => {
    return (
        <TableContext.Provider value={{ ...rest}}>
            {children}
        </TableContext.Provider>
    );
}

export default TableContextProvider;