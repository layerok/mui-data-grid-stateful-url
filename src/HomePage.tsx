import {
  DataGridPremium,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowsProp,
  GridSortModel
} from "@mui/x-data-grid-premium";
import {useNavigate, useSearchParams} from "react-router-dom";
import sortBy from 'sort-by';
import {useState} from "react";

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
];

// { items: [{field: id, id: 4343, operator: start_with, value: 34343},{field: id, id: 44444, operator: start_with, value: 34343}], logicOperator: 'or'}

enum SearchParamNames  {
  SortModel = 'sortModel',
  PaginationModel = 'paginationModel',
  FilterModel = 'filterModel'
}

const convertSortModalToBackendSort = (sortModel: GridSortModel) => {
  if(sortModel.length > 0) {
    const {sort, field } = sortModel[0];
    const isDesc = sort === 'desc';
    return `${isDesc ? '-': ''}${field}`
  }
  return undefined;
}

const convertFilterModalToBackendFilters = (filterModel: GridFilterModel) => {
  if(filterModel.items.length > 0) {
    return filterModel.items.reduce((acc, item) => {
      return {
        ...acc,
        [item.field]: item.value
      }
    }, {})
  }
  return undefined;
}

const rows: GridRowsProp = [
  { id: 1, col1: 'Hello', col2: 'World' },
  { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 3, col1: 'MUI', col2: 'is Amazing' },
  { id: 4, col1: 'DataGridPro2', col2: 'is Awesome f' },
  { id: 5, col1: 'MUI2', col2: 'is Amazing f' },
  { id: 6, col1: 'Hello', col2: 'World' },
  { id: 7, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 8, col1: 'MUI', col2: 'is Amazing' },
  { id: 9, col1: 'DataGridPro2', col2: 'is Awesome f' },
  { id: 10, col1: 'MUI2', col2: 'is Amazing f' },
  { id: 11, col1: 'MUI2', col2: 'is Amazing f' },
];
const fetchRows = (params: {
  offset: number,
  limit: number,
  sort?: string,
  filter?: Record<string, string>
}) => {
  const {offset, limit, sort, filter = {} } = params;

  const filteredRows = rows.filter(row => {

    const keys = Object.keys(filter);
    return keys.every(key => !row[key] || row[key].includes(filter[key]))
  })

  const sortedRows = [...filteredRows];

  if(sort) {
    sortedRows.sort(sortBy(sort))
  }

  const paginatedRows = sortedRows.slice(offset, offset + limit);

  return {
    count: rows.length,
    data: paginatedRows
  }
}
export const HomePage = () => {

  const [sortModel, setSortModel] = useSortModelControlledByUrl({
    searchParamName: SearchParamNames.SortModel
  });

  const [paginationModel, setModel] = usePaginationModelControlledByUrl({
    defaultPageSize: 0,
    defaultPage: 0,
    autoPageSize: true,
    searchParamName: SearchParamNames.PaginationModel
  })

  const [filterModel, setFilterModel] = useFilterModelControlledByUrl({
    filterModelSearchName: SearchParamNames.FilterModel,
    paginationModelSearchName: SearchParamNames.PaginationModel,
  })

  const {pageSize, page} = paginationModel

  const res = fetchRows({
    offset: page * pageSize,
    limit: pageSize,
    filter: convertFilterModalToBackendFilters(filterModel),
    sort: convertSortModalToBackendSort(sortModel)
  })

  return <DataGridPremium
    sx={{
      height: 300
    }}
    rowCount={res.count}
    pagination
    autoPageSize
    paginationMode={'server'}
    filterMode={'server'}
    sortingMode={'server'}
    sortModel={sortModel}
    onSortModelChange={setSortModel}
    paginationModel={paginationModel}
    onPaginationModelChange={setModel}
    filterModel={filterModel}
    onFilterModelChange={setFilterModel}
    disableMultipleColumnsSorting
    headerFilters
    rows={res.data}
    columns={columns}
  />
}

const useFilterModelControlledByUrl = ({
  filterModelSearchName = 'filterModel',
  paginationModelSearchName = 'paginationModel',
                                       }: {
  filterModelSearchName?: string
  paginationModelSearchName?: string
} = {}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();

  const setModel = (model: GridFilterModel) => {
    searchParams.delete(paginationModelSearchName);
    if(!model.items.length) {
      searchParams.delete(filterModelSearchName);
    } else {
      searchParams.set(filterModelSearchName, JSON.stringify(model));
    }

    navigate({
      search: searchParams.toString()
    })
  };

  const serializedFilterModel = searchParams.get(filterModelSearchName)

  const model: GridFilterModel = serializedFilterModel ? JSON.parse(serializedFilterModel): {
    items: []
  }

  return [model, setModel] as const;
}

const usePaginationModelControlledByUrl = ({
  defaultPage = 1,
  defaultPageSize = 25,
  searchParamName = 'paginationModel',
  autoPageSize = false
                                        }: {
  defaultPageSize?: number,
  defaultPage?: number,
  searchParamName?: string;
  autoPageSize?: boolean;
} = {}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();
  const [autoPageSized, setAutoPageSized] = useState(false);
  const setModel =(model: GridPaginationModel) => {
    searchParams.set(searchParamName, JSON.stringify(model));
    if(autoPageSize && !autoPageSized) {
      setAutoPageSized(true);
    }

    navigate({
      search: searchParams.toString()
    })
  };

  const serializedModel = searchParams.get(searchParamName);
  const model: GridPaginationModel = serializedModel ? JSON.parse(serializedModel): {
    page: autoPageSize ? 0:  defaultPage,
    pageSize: autoPageSize ? 0: defaultPageSize
  }

  if(autoPageSize && !autoPageSized) {
    model.pageSize = 0;
  }

  return [model, setModel] as const;
}

const useSortModelControlledByUrl = ({
  searchParamName = 'sortModel'
                                     }: {
  searchParamName?: string;
} = {}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();

  const setModel = (model: GridSortModel) => {
    if(model.length) {
      searchParams.set(searchParamName, JSON.stringify(model));
    } else {
      searchParams.delete(searchParamName)
    }

    navigate({
      search: searchParams.toString()
    })
  }

  const serializedModel = searchParams.get(searchParamName);

  const model: GridSortModel = serializedModel ? JSON.parse(serializedModel): []

  return [model, setModel] as const;
}
