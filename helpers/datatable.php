<?php

if (!function_exists('datatable')) {
    function datatable()
    {
        return \Yajra\Datatables\Facades\Datatables::getFacadeRoot();
    }
}
