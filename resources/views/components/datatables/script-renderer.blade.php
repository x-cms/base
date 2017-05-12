<script>
    $(window).on('load', function () {
        new Xcms.DataTableAjax($('{{ $selector }}'), {
            dataTableParams: {
                ajax: {
                    url: '{!! $ajaxUrl[0] or '' !!}',
                    method: '{!! $ajaxUrl[1] or 'GET' !!}',
                    data: {
                        _token: '{{ csrf_token() }}'
                    }
                },
                columns: {!! $columns or '[]' !!}
            }
        });
    });
</script>
