@php
    $hasFilter = isset($filters) && $filters ? true : false;
    $hasTableActions = isset($groupActions) && $groupActions ? true : false;
    $totalColumns = sizeof($headings);
@endphp
<div class="box-body table-responsive no-padding">
    <table class="table table-hover text-center datatables">
        <thead>
        <tr role="row" class="heading">
            @foreach($headings as $heading)
                <th>{{ $heading['title'] or '' }}</th>
            @endforeach
        </tr>
        </thead>
        <tbody>

        </tbody>
    </table>
</div>
