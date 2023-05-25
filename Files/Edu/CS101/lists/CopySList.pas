
/// <summary>
/// ������ ����� ������������ ������ first
/// </summary>
/// <returns>������ �� ������ ������� ������-����� first</returns>
function CopySList<T>(first: SNode<T>): SNode<T>;
begin
  if first = nil then
    Result := nil
  else
    Result := new SNode<T>(first.data, CopySList(first.next));
end;