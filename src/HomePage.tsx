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
];
const fetchRows = (params: {
  offset: number,
  limit: number,
  sort?: string,
  filter?: Record<string, string>
}) => {
  const {offset, limit, sort, filter = {} } = params;
  console.log(params);

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

  const modelsControlledByUrl = {
    ...useSortModelControlledByUrl({
      searchParamName: SearchParamNames.SortModel
    }),
    ...usePaginationModelControlledByUrl({
      defaultPageSize: 3,
      defaultPage: 0,
      searchParamName: SearchParamNames.PaginationModel
    }),
    ...useFilterModelControlledByUrl({
      filterModelSearchName: SearchParamNames.FilterModel,
      paginationModelSearchName: SearchParamNames.PaginationModel,
    })
  }

  const {pageSize, page} = modelsControlledByUrl.paginationModel

  const res = fetchRows({
    offset: page * pageSize,
    limit: pageSize,
    filter: convertFilterModalToBackendFilters(modelsControlledByUrl.filterModel),
    sort: convertSortModalToBackendSort(modelsControlledByUrl.sortModel)
  }, )

  return <DataGridPremium
    rowCount={res.count}
    pagination
    paginationMode={'server'}
    filterMode={'server'}
    sortingMode={'server'}
    {...modelsControlledByUrl}
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

  const onFilterModelChange = (model: GridFilterModel) => {
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

  const filterModel: GridFilterModel = serializedFilterModel ? JSON.parse(serializedFilterModel): {
    items: []
  }

  return {
    onFilterModelChange,
    filterModel,
  };
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
  const onPaginationModelChange =(model: GridPaginationModel) => {
    searchParams.set(searchParamName, JSON.stringify(model));
    if(autoPageSize && !autoPageSized) {
      setAutoPageSized(true);
    }

    navigate({
      search: searchParams.toString()
    })
  };

  const serializedModel = searchParams.get(searchParamName);
  const paginationModel: GridPaginationModel = serializedModel ? JSON.parse(serializedModel): {
    page: autoPageSize ? 0:  defaultPage,
    pageSize: autoPageSize ? 0: defaultPageSize
  }

  if(autoPageSize && !autoPageSized) {
    paginationModel.pageSize = 0;
  }

  return {
    onPaginationModelChange,
    paginationModel
  }
}

const useSortModelControlledByUrl = ({
  searchParamName = 'sortModel'
                                     }: {
  searchParamName?: string;
} = {}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();

  const onSortModelChange = (model: GridSortModel) => {
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

  const sortModel: GridSortModel = serializedModel ? JSON.parse(serializedModel): []

  return {
    onSortModelChange,
    sortModel
  }
}
