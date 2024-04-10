import {
  DataGridPremium,
  GridColDef, GridFilterItem,
  GridFilterModel,
  GridPaginationModel,
  GridRowsProp,
  GridSortModel
} from "@mui/x-data-grid-premium";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useCallback, useMemo} from "react";

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
];

enum SearchParamNames  {
  Sort = 'sort',
  Page = 'page',
  PageSize = 'pageSize'
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
  const [searchParams] = useSearchParams();
  const defaultPage = 0;
  const defaultPageSize = 3;
  const modelsControlledByUrl = {
    ...useSortModelControlledByUrl({
      searchParamKey: SearchParamNames.Sort
    }),
    ...usePaginationModelControlledByUrl({
      pageSizeSearchParamKey: SearchParamNames.PageSize,
      pageSearchParamKey: SearchParamNames.Page,
      defaultPageSize: defaultPageSize,
      defaultPage: defaultPage
    }),
    ...useFilterModelControlledByUrl(columns)
  }

  const page = +(searchParams.get(SearchParamNames.Page) || defaultPage)
  const pageSize = +(searchParams.get(SearchParamNames.PageSize) || defaultPageSize)
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

const useFilterModelControlledByUrl = (columns: GridColDef[]) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();

  const onFilterModelChange = useCallback((model: GridFilterModel) => {
    columns.forEach(col => {
      const {filterKey,filterModeKey} = createHeaderFilterSearchParamKeys(col.field);
      searchParams.delete(filterKey)
      searchParams.delete(filterModeKey)
    })

    model.items.forEach((item) => {
      const {filterKey,filterModeKey} = createHeaderFilterSearchParamKeys(item.field);
      searchParams.set(filterKey, item.value);
      searchParams.set(filterModeKey, item.operator);
    })

    navigate({
      search: searchParams.toString()
    })
  }, [navigate, searchParams, columns]);

  const filterModel: GridFilterModel = useMemo(() => ({
    items: columns.map(column => {
      const {filterKey,filterModeKey} = createHeaderFilterSearchParamKeys(column.field);
      const value = searchParams.get(filterKey);
      const operator = searchParams.get(filterModeKey);

      return {
        id: column.field,
        value,
        operator,
        field: column.field
      };
    }).filter((filter) => !!filter.value)
  }), [columns, searchParams])

 // console.log('filter', filterModel)

  return useMemo(() => ({
    onFilterModelChange,
   filterModel
  }), [onFilterModelChange, filterModel])
}

const usePaginationModelControlledByUrl = ({
  pageSearchParamKey,
  pageSizeSearchParamKey,
  defaultPage = 1,
  defaultPageSize = 25
                                        }: {
  pageSearchParamKey: string,
  pageSizeSearchParamKey: string,
  defaultPageSize?: number,
  defaultPage?: number
}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();
  const onPaginationModelChange = useCallback((model: GridPaginationModel) => {
    searchParams.set(pageSearchParamKey, model.page + "");
    searchParams.set(pageSizeSearchParamKey, model.pageSize + "");
    navigate({
      search: searchParams.toString()
    })
  }, [searchParams, navigate, pageSearchParamKey, pageSizeSearchParamKey])

  const currentPage = +(searchParams.get(pageSearchParamKey) || defaultPage);
  const currentPageSize = +(searchParams.get(pageSizeSearchParamKey) || defaultPageSize);

  const paginationModel: GridPaginationModel = useMemo(() => ({
    page: currentPage,
    pageSize:  currentPageSize
  }), [currentPage, currentPageSize])

  return useMemo(() => ({
    onPaginationModelChange,
    paginationModel
  }), [onPaginationModelChange, paginationModel])
}

const useSortModelControlledByUrl = ({
  searchParamKey = "sort",
  delimiter = ',',
  descendingPrefix = '-'
                                  }: {
  searchParamKey?: string,
  delimiter?: string,
  descendingPrefix?: string
}) => {
  const [searchParams, ] = useSearchParams();
  const navigate = useNavigate();

  const onSortModelChange = useCallback((model: GridSortModel) => {
    searchParams.delete(searchParamKey)

    const sorts = model.filter((item) => item.sort).map((item) => {
      return item.sort === "asc" ? item.field: `${descendingPrefix}${item.field}`;
    })

    if(sorts.length > 0) {
      searchParams.set(searchParamKey, sorts.join(delimiter))
    }

    navigate({
      search: searchParams.toString()
    })
  }, [searchParams, navigate, delimiter, descendingPrefix, searchParamKey]);

  const sortValue = searchParams.get(searchParamKey)

  const sortModel: GridSortModel = useMemo(() => (sortValue ? sortValue.split(delimiter): []).map((value) => {
    const isDesc = value.startsWith(descendingPrefix);

    const field = isDesc ? value.slice(1, value.length): value;
    const sort = isDesc ? 'desc': 'asc';

    return {
      sort,
      field
    }
  }), [sortValue, descendingPrefix, delimiter])

  return useMemo(() => ({
    onSortModelChange,
    sortModel
  }), [onSortModelChange, sortModel])
}
