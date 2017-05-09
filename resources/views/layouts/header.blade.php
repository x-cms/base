<header class="main-header">
    <a href="index2.html" class="logo">
        <span class="logo-mini"><b>CMS</b></span>
        <span class="logo-lg"><b>Lara</b>CMS</span>
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
                        <img src="{{ isset(Auth::guard('admin')->user()->avatar) ? get_image(Auth::guard('admin')->user()->avatar) : get_image('vendor/core/images/no-avatar-other.jpg') }}" class="user-image" alt="User Image">
                        <span class="hidden-xs">{{ Auth::guard('admin')->user()->username }}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="user-header">
                            <img src="{{ isset(Auth::guard('admin')->user()->avatar) ? get_image(Auth::guard('admin')->user()->avatar) : get_image('vendor/core/images/no-avatar-other.jpg') }}" class="img-circle" alt="User Image">
                            <p>
                                {{ Auth::guard('admin')->user()->username }} - Web Developer
                                <small>Member since {{ Auth::guard('admin')->user()->created_at }}</small>
                            </p>
                        </li>
                        <li class="user-footer">
                            <div class="pull-left">
                                <a href="#" class="btn btn-default btn-flat">Profile</a>
                            </div>
                            <div class="pull-right">
                                <a href="{{ route('admin.logout') }}" class="btn btn-default btn-flat">Sign out</a>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
</header>