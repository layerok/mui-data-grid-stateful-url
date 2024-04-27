import {
  DataGridPremium,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowsProp,
  GridSortModel, GridValidRowModel
} from "@mui/x-data-grid-premium";
import {useSearchParams} from "react-router-dom";
import sortBy from 'sort-by';
import {useEffect, useState} from "react";

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
  { id: 2, col1: 'Gen', col2: 'is Awesome' },
  { id: 3, col1: 'four', col2: 'is Amazing' },
  { id: 4, col1: 'rRdf', col2: 'firwff' },
  { id: 5, col1: 'MUI2', col2: 'maple' },
  { id: 6, col1: 'Hello', col2: 'World' },
  { id: 7, col1: 'Svgg', col2: 'F savage' },
  { id: 8, col1: 'ff', col2: 'irundal' },
  { id: 9, col1: 'DataGridPro2', col2: 'icarir' },
  { id: 10, col1: 'arch', col2: 'horosh' },
  { id: 11, col1: 'rok', col2: 'noob' },
];

type Data = {
  data: GridValidRowModel[];
  count: number;
}

const fetchRows = async (params: {
  offset: number,
  limit: number,
  sort?: string,
  filter?: Record<string, string>
}): Promise<Data> => {
  await new Promise((resolve) => setTimeout(() => {
    resolve(true)
  }, 2000))
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
    count: filteredRows.length,
    data: paginatedRows
  }
}
export const HomePage = () => {

  const {
    paginationModel,
    setPaginationModel,
    filterModel,
    setFilterModel,
    sortModel,
    setSortModel,
    goToPage,
    calculatedPageSize
  } = useDataGridUrlState();


  const { page} = paginationModel

  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);

  const params = {
    offset: page * calculatedPageSize,
    limit: calculatedPageSize,
    filter: convertFilterModalToBackendFilters(filterModel),
    sort: convertSortModalToBackendSort(sortModel)
  };

  useEffect(() => {
    setLoading(true);
    fetchRows(params).then(setData).finally(() => {
      setLoading(false)
    })
  }, [JSON.stringify(params)]);

  const rows = data?.data || [];
  const rowCount = data?.count || 0;

  return <div>
    <div>
      {data?.count && calculatedPageSize && (
        <>
          <button  onClick={() => {
            if(page === 0) {
              return;
            }
            goToPage(paginationModel.page -1 )
          }}>&lt;</button>
          <button>{page + 1}</button>
          <button onClick={() => {
            const totalPages = Math.ceil(data.count / calculatedPageSize);
            if(page === totalPages - 1) {
              return;
            }
            goToPage(page +1 )
          }}>&gt;</button>

          <span>
            out of {Math.ceil(data.count / calculatedPageSize)}
          </span>
        </>
      )}


    </div>
    <DataGridPremium
      sx={{
        height: 300
      }}
      rowCount={rowCount}
      pagination
      loading={loading}
      autoPageSize
      hideFooterPagination
      paginationMode={'server'}
      filterMode={'server'}
      sortingMode={'server'}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      filterModel={filterModel}
      onFilterModelChange={setFilterModel}
      disableMultipleColumnsSorting
      headerFilters
      rows={rows}
      columns={columns}
    />
  </div>
}

const useDataGridUrlState = (props: {
  page?: number;
  pageSize?: number;
  autoPageSize?: boolean
} = {}) => {
  const { page = 0, pageSize = 25, autoPageSize = true} = props;
  const [searchParams, setSearchParams, ] = useSearchParams();
  const [calculatedPageSize, setCalculatedPageSize] = useState(0);

  // eslint-disable-next-line
  const serialize = (data: any) => JSON.stringify(data);
  const deserialize = (string: string) => JSON.parse(string);

  const setSortModel = (model: GridSortModel) => {
    if(model.length) {
      searchParams.set(SearchParamNames.SortModel, serialize(model));
    } else {
      searchParams.delete(SearchParamNames.SortModel)
    }

    setSearchParams(searchParams)
  }

  const serializedSortModel = searchParams.get(SearchParamNames.SortModel);

  const sortModel: GridSortModel = serializedSortModel ? deserialize(serializedSortModel): []

  const setFilterModel = (model: GridFilterModel) => {
    searchParams.delete(SearchParamNames.PaginationModel);
    if(!model.items.length) {
      searchParams.delete(SearchParamNames.FilterModel);
    } else {
      searchParams.set(SearchParamNames.FilterModel, serialize(model));
    }
    setSearchParams(searchParams)
  };

  const serializedFilterModel = searchParams.get(SearchParamNames.FilterModel);

  const filterModel: GridFilterModel = serializedFilterModel ? deserialize(serializedFilterModel): {
    items: []
  }

  const setPaginationModel =(model: GridPaginationModel) => {
    if(model.pageSize) {
      setCalculatedPageSize(model.pageSize);
    }

    searchParams.set(SearchParamNames.PaginationModel, serialize(model));

    setSearchParams(searchParams)
  };

  const serializedPaginationModel = searchParams.get(SearchParamNames.PaginationModel);
  const paginationModel: GridPaginationModel = serializedPaginationModel ? deserialize(serializedPaginationModel): {
    page,
    pageSize
  }

  if(autoPageSize) {
    paginationModel.pageSize = 0;
  }

  const goToPage = (page: number) => {
    searchParams.set(SearchParamNames.PaginationModel, serialize({
      page,
    }))
    setSearchParams(searchParams);
  }

  return {
    sortModel,
    setSortModel,
    paginationModel,
    setPaginationModel,
    filterModel,
    setFilterModel,
    goToPage,
    calculatedPageSize
  }
}
