<header class="main-header">
    <a href="{{ url('admin') }}" class="logo">
        <span class="logo-mini"><b>CMS</b></span>
        <span class="logo-lg"><b>X</b>CMS</span>
    </a>
    <nav class="navbar navbar-static-top">
        <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button">
            <span class="sr-only">Toggle navigation</span>
        </a>
        <div class="navbar-custom-menu">
            <ul class="nav navbar-nav">
                <li><a href="/" target="_blank"><i class="fa fa-eye"></i> 查看站点</a></li>
                <li class="dropdown user user-menu">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <img src="{{ isset($loggedInUser->avatar) ? get_image($loggedInUser->avatar) : get_image('vendor/core/images/no-avatar-other.jpg') }}" class="user-image" alt="User Image">
                        <span class="hidden-xs">{{ $loggedInUser->username }}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="user-header">
                            <img src="{{ isset($loggedInUser->avatar) ? get_image($loggedInUser->avatar) : get_image('vendor/core/images/no-avatar-other.jpg') }}" class="img-circle" alt="User Image">
                            <p>
                                {{ $loggedInUser->username }} - Web Developer
                                <small>Member since {{ $loggedInUser->created_at }}</small>
                            </p>
                        </li>
                        <li class="user-footer">
                            <div class="pull-left">
                                <a href="#" class="btn btn-default btn-flat">编辑资料</a>
                            </div>
                            <div class="pull-right">
                                <a href="{{ route('admin.logout') }}" class="btn btn-default btn-flat">安全退出</a>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
</header>