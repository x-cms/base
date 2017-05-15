<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>AdminLTE 2 | Dashboard</title>
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="//cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="//cdn.bootcss.com/ionicons/2.0.1/css/ionicons.min.css">
    @stack('styles')
    <link rel="stylesheet" href="{{ asset('vendor/core/css/AdminLTE.css') }}">
    <link rel="stylesheet" href="{{ asset('vendor/core/css/skins/_all-skins.min.css') }}">
    @stack('css')

</head>
<body class="hold-transition skin-blue sidebar-mini">
    <div class="wrapper">
        {{--BEGIN Header--}}
        @include('base::layouts.header')
        {{--END Header--}}

        {{--BEGIN Sidebar--}}
        @include('base::layouts.sidebar')
        {{--END Sidebar--}}

        <div class="content-wrapper">
            <section class="content-header">
                {{--BEGIN Page title--}}
                @include('base::partials.page-title')
                {{--END Page title--}}
                {{--BEGIN Breadcrumbs--}}
                @include('base::partials.breadcrumbs')
                {{--END Breadcrumbs--}}
            </section>

            <section class="content">
                {{--BEGIN Content--}}
                @yield('content')
                {{--END Content--}}
            </section>
        </div>

        {{--BEGIN Footer--}}
        @include('base::layouts.footer')
        {{--END Footer--}}

    </div>

    <!--[if lt IE 9]>
    <script src="//cdn.bootcss.com/html5shiv/r29/html5.min.js"></script>
    <script src="//cdn.bootcss.com/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

    <script src="//cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>
    <script src="//cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="//cdn.bootcss.com/jQuery-slimScroll/1.3.8/jquery.slimscroll.min.js"></script>
    <script src="//cdn.bootcss.com/fastclick/1.0.6/fastclick.min.js"></script>
    <script src="{{ asset('vendor/core/js/demo.js') }}"></script>
    <script src="{{ asset('vendor/core/js/app.min.js') }}"></script>
    @stack('scripts')
    @stack('js')
</body>
</html>
