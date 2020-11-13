@extends('layouts.app')

@section('title', 'Data Pengumuman')

@section('content')

<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.22/css/jquery.dataTables.css">

<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>

@if (session('status'))
<div class="alert alert-success">
    {{ session('status') }}
</div>
@endif
@if (session('delete'))
<script>
        swal({
            icon: 'info',
            title: 'Data berhasil dihapus!',
        });
</script>
@endif

<style>
  .pointer{
    cursor:pointer;
  }
</style>

    <div class="container">
       <h2>Kelola Pengumuman</h2>

          <div class="table-responsive">

            <a href="/pengumuman/create" class="btn btn-primary">Buat Pengumuman</a>
            <br><br>
          <table class="table table-hover" id="table">
            <thead>
              <tr class="up">
                <th scope="col">No</th>
                <th scope="col">
                    judul
                    <i class="fas fa-sort-amount-down pointer" onclick="sortTable(0)"></i>
                    <i class="fas fa-sort-amount-up pointer" onclick="sortTable(0)"></i>
                </th>
                <th scope="col">
                    <center> isi
                    <i class="fas fa-sort-amount-down pointer" onclick="sortTable(0)"></i>
                    <i class="fas fa-sort-amount-up pointer" onclick="sortTable(0)"></i>
                </center>
                </th>
                <th scope="col">Tanggal
                    <i class="fas fa-sort-amount-down pointer" onclick="sortTable(2)"></i>
                    <i class="fas fa-sort-amount-up pointer" onclick="sortTable(2)"></i>
                </th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg">
                <?php  $count = 1; ?>
            @foreach ($value as $values)
              <tr>
              <th scope="row">{{ $value->perPage()*($value->currentPage()-1)+$count }}</th>
                <td>{{ $values['judul'] }}</td>
                <td>{!! $values['isi'] !!}</td>
                <td>{{ $values['created_at'] }}</td>
                <td>
                    <div class="btn-group" role="group">
                       <form action="/pengumuman/{{ $values->id }}" method="POST">
                            @method('delete')
                            @csrf
                            <button type="submit" class="btn btn-danger" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="left" data-content="Hapus Pengumuman?" onclick="return confirm('Apakah anda yakin ingin menghapus data ini?')" onclick="showAlert()"><i class="fas fa-trash-alt"></i></button>
                        </form>
                    </div>
                </td>
              </tr>
              <?php $count++; ?>
              @endforeach
            </tbody>
            <tfoot>
                {{ $value->links() }}
            </tfoot>
          </table>
        </div>

    </div>

    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.22/js/jquery.dataTables.js"></script>

    <script>
      $(document).ready(function(){
        $('[data-toggle="popover"]').popover();
      });

      function sortTable(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("table");
        switching = true;

        dir = "asc";

        while (switching) {
          switching = false;
          rows = table.rows;

          for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
              }
            } else if (dir == "desc") {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
              }
            }
          }
          if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
          } else {
            if (switchcount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
            }
          }
        }
      }
    </script>
    <script>
        $(document).ready( function () {
        $('#table').DataTable();
    } );
    </script>

    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script>
        function showAlert() {
            swal({
                icon: 'info',
                title: 'Data berhasil dihapus!',
                timer: 1500
            });
        }
    </script>
@endsection