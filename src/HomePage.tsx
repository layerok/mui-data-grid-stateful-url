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

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
];

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

const createHeaderFilterSearchParamKeys = (field: string) => {
  return {
    filterKey: `filter[${field}]`,
    filterModeKey: `filter_mode[${field}]`,
  }
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
  sort?: string
}) => {
  const {offset, limit, sort } = params;
  console.log(params);

  const sortedRows = [...rows];

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
      searchParamName: SearchParamNames.FilterModel
    })
  }

  const {pageSize, page} = modelsControlledByUrl.paginationModel

  const res = fetchRows({
    offset: page * pageSize,
    limit: pageSize,
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
    disableMultipleColumnsFiltering
    headerFilters
    rows={res.data}
    columns={columns}
  />
}

const useFilterModelControlledByUrl = ({
  searchParamName = 'filterModel'
                                       }: {
  searchParamName?: string
} = {}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();

  const onFilterModelChange = (model: GridFilterModel) => {
    if(!model.items.length) {
      searchParams.delete(searchParamName);
    } else {
      searchParams.set(searchParamName, JSON.stringify(model));
    }

    navigate({
      search: searchParams.toString()
    })
  };

  const serializedFilterModel = searchParams.get(searchParamName)

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
  searchParamName = 'paginationModel'
                                        }: {
  defaultPageSize?: number,
  defaultPage?: number,
  searchParamName?: string;
} = {}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();
  const onPaginationModelChange =(model: GridPaginationModel) => {
    searchParams.set(searchParamName, JSON.stringify(model));

    navigate({
      search: searchParams.toString()
    })
  };

  const serializedModel = searchParams.get(searchParamName);
  const paginationModel: GridPaginationModel = serializedModel ? JSON.parse(serializedModel): {
    page:  defaultPage,
    pageSize: defaultPageSize
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
