import React, { useState } from "react";
import {
    Box,
    Checkbox,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Theme,
} from "@material-ui/core";
import clsx from "clsx";
import SearchInput from "../search-input/SearchInput";
import { version } from "process";
import { IdentifiableObject } from "../../state/ListState";

const useStyles = makeStyles((theme: Theme) => ({
    root: {},
    content: {
        padding: theme.spacing(0),
    },
    paper: {
        width: "100%",
        marginBottom: theme.spacing(2),
    },
    nameContainer: {
        display: "flex",
        alignItems: "center",
    },
    tableRow: {},
    actions: {
        justifyContent: "flex-end",
    },
    toolbar: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}));

export interface TableColumn<T> {
    name: keyof T;
    text: string;
    getValue?: (row: T) => JSX.Element;
}

interface ObjectsTableProps<T> {
    className?: string;
    columns: TableColumn<T>[];
    rows: T[];
    search?: string;
    onSearchChange?: (search: string) => void;
    searchEnable?: boolean;
}

export default function DataTable<T extends IdentifiableObject>({
    rows,
    className,
    columns,
    search = "",
    onSearchChange,
    searchEnable,
}: ObjectsTableProps<T>) {
    const classes = useStyles();

    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [pageRows, setPageRows] = useState<T[]>(rows);
    const [page, setPage] = useState(0);
    const [searchVisible] = useState(searchEnable || true);
    const rowsPerPageOptions = [5, 10, 25];

    React.useEffect(() => {
        const start = page * rowsPerPage;
        const result = rows.slice(start, start + rowsPerPage);

        setPageRows(result);
    }, [search, page, rowsPerPage, columns, rows]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.checked ? pageRows.map(feed => feed.id) : [];

        setSelectedRows(selected);
    };

    const handleSelectOne = (_event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const selectedIndex = selectedRows.indexOf(id);
        let newSelectedRows: string[] = [];

        if (selectedIndex === -1) {
            newSelectedRows = newSelectedRows.concat(selectedRows, id);
        } else if (selectedIndex === 0) {
            newSelectedRows = newSelectedRows.concat(selectedRows.slice(1));
        } else if (selectedIndex === selectedRows.length - 1) {
            newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelectedRows = newSelectedRows.concat(
                selectedRows.slice(0, selectedIndex),
                selectedRows.slice(selectedIndex + 1)
            );
        }

        setSelectedRows(newSelectedRows);
    };

    const handlePageChange = (_event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
        setPage(page);
    };

    const handleRowsPerPageChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        setRowsPerPage(+event.target.value);
    };

    const handleSearch = (value: string) => {
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    return (
        <div className={clsx(classes.root, className)}>
            <Box
                className={classes.toolbar}
                display="flex"
                justifyContent="space-between"
                flexDirection="row">
                {searchVisible && <SearchInput value={search} onChange={handleSearch} />}
            </Box>
            <Paper className={classes.paper}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedRows.length === pageRows.length}
                                        color="primary"
                                        indeterminate={
                                            selectedRows.length > 0 &&
                                            selectedRows.length < pageRows.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>

                                {columns.map((column, index) => {
                                    return <TableCell key={index}>{column.text}</TableCell>;
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageRows.map(item => (
                                <TableRow
                                    className={classes.tableRow}
                                    hover
                                    key={item.id}
                                    selected={selectedRows.indexOf(item.id) !== -1}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedRows.indexOf(version) !== -1}
                                            color="primary"
                                            onChange={event => handleSelectOne(event, item.id)}
                                            value="true"
                                        />
                                    </TableCell>

                                    {columns.map((column, index) => {
                                        const cellContent = !column.getValue
                                            ? item[column.name]
                                            : column.getValue(item);
                                        return (
                                            <TableCell key={`${item.id}-${index}`}>
                                                {cellContent}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={rows.length}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handleRowsPerPageChange}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={rowsPerPageOptions}
                />
            </Paper>
        </div>
    );
}