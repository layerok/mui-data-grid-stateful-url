import {
  DataGridPremium,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowsProp,
  GridSortModel
} from "@mui/x-data-grid-premium";
import {useNavigate, useSearchParams} from "react-router-dom";

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
];

enum SearchParamNames  {
  SortModel = 'sortModel',
  PaginationModel = 'paginationModel',
  FilterModel = 'filterModel'
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
const fetchRows = (offset: number, limit: number) => {
  return {
    count: rows.length,
    data: rows.slice(offset, offset + limit)
  }
}
export const HomePage = () => {

  const defaultPage = 0;
  const defaultPageSize = 3;
  const modelsControlledByUrl = {
    ...useSortModelControlledByUrl({
      searchParamName: SearchParamNames.SortModel
    }),
    ...usePaginationModelControlledByUrl({
      defaultPageSize: defaultPageSize,
      defaultPage: defaultPage,
      searchParamName: SearchParamNames.PaginationModel
    }),
    ...useFilterModelControlledByUrl({
      searchParamName: SearchParamNames.FilterModel
    })
  }

  const {pageSize, page} = modelsControlledByUrl.paginationModel

  const res = fetchRows(page * pageSize, pageSize)

  return <DataGridPremium
    rowCount={res.count}
    pageSizeOptions={[pageSize]}
    pagination
    paginationMode={'server'}
    filterMode={'server'}
    sortingMode={'server'}
    {...modelsControlledByUrl}
    disableMultipleColumnsSorting={false}
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

  const filterModel = serializedFilterModel ? JSON.parse(serializedFilterModel): {
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
  const paginationModel = serializedModel ? JSON.parse(serializedModel): {
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

  const sortModel = serializedModel ? JSON.parse(serializedModel): []

  return {
    onSortModelChange,
    sortModel
  }
}
