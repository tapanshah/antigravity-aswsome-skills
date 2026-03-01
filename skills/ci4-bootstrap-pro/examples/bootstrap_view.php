<div class="page-content">
    <div class="container-fluid">

        <!-- start page title -->
        <div class="row">
            <div class="col-12">
                <div class="page-title-box d-flex align-items-center justify-content-between">
                    <h4 class="mb-0"><?= $title ?></h4>

                    <div class="page-title-right">
                        <ol class="breadcrumb m-0">
                            <li class="breadcrumb-item"><a href="<?= site_url('dashboard') ?>">Dashboard</a></li>
                            <li class="breadcrumb-item active"><?= $title ?></li>
                        </ol>
                    </div>

                </div>
            </div>
        </div>
        <!-- end page title -->

        <div class="row">
            <div class="col-xl-12">
                <div class="card">
                    <div class="card-header align-items-center d-flex">
                        <h4 class="card-title mb-0 flex-grow-1">Content Title</h4>
                        <div class="flex-shrink-0">
                            <button type="button" id="cmdAdd" class="btn btn-primary btn-sm waves-effect waves-light">
                                <i class="fas fa-plus me-1"></i> Add New
                            </button>
                        </div>
                    </div><!-- end card header -->

                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover table-centered table-nowrap mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Field 1</th>
                                        <th>Field 2</th>
                                        <th>Status</th>
                                        <th class="text-center" style="width: 100px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Loop through data -->
                                    <tr>
                                        <td>Data 1</td>
                                        <td>Data 2</td>
                                        <td><span class="badge bg-success">Active</span></td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-primary btn-sm"><i class="fas fa-edit"></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div><!-- end card-body -->
                </div><!-- end card -->
            </div><!-- end col -->
        </div><!-- end row -->

    </div> <!-- container-fluid -->
</div>
<!-- End Page-content -->
