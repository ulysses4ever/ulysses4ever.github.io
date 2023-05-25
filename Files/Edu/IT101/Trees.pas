type TreeNode<T> = class
  data: T;
  left, right: TreeNode<T>;
  
  constructor(data: T; left, right: TreeNode<T>);
  begin
    self.data := data;
    self.left := left;
    self.right := right;
  end;
  
  procedure Print();
  begin
    write(data, ' ');
  end;
end;

// #1
procedure Print<T>(root : TreeNode<T>; level : integer := 0);
begin
  if root <> nil then
  begin
    Print(root.left, level + 1);
    writeln(root.data : level * 4);
    Print(root.right, level + 1);
  end;
end;

// #2
function CreateLeftHandedTree(params a :  array of integer) : TreeNode<integer>;
begin
  var p := new TreeNode<integer>(a[0], nil, nil);
  result := p;
  for var i := 1 to a.Length - 1 do
  begin
    p.left := new TreeNode<integer>(a[i], nil, nil);
    p := p.left;
  end;
end;

// #3
function CreateRandomTree(n: integer := 6;
                             a : integer := -10; b : integer := 10)
                             : TreeNode<integer>;
begin
  if n <= 0 then
    result := nil
  else
  begin
    var rnd: integer := Random(n);
    result := new TreeNode<integer>(Random(a, b), CreateRandomTree(rnd, a, b), 
                                  CreateRandomTree(n - 1 - rnd, a, b));
  end;  
end;

// #4
function CreateRandomBST(n: integer := 6;
                             a : integer := -20; b : integer := 20)
                             : TreeNode<integer>;
begin
  if n <= 0 then
    result := nil
  else
  begin
    var rnd: integer := Random(n);
    var val := Random(a, b);
    result := new TreeNode<integer>(val, CreateRandomBST(rnd, a, val), 
                                  CreateRandomBST(n - 1 - rnd, val, b));
  end;  
end;

// #5
function IsBST(root : TreeNode<integer>): boolean;

  function Impl(root : TreeNode<integer>;
                                  minVal, maxVal : integer): boolean;                                  
  begin
    result := (root = nil)
        or (minVal <= root.data)
          and (root.data <= maxVal)
          and Impl(root.left, integer.MinValue, root.data)
          and Impl(root.right, root.data, integer.MaxValue)
  end;

begin
  result := Impl(root, integer.MinValue, integer.MaxValue);
end;

// #6
function CreateIdeallyBalanced(n :integer := 6;
            a : integer := -10; b : integer := 10): TreeNode<integer>;
begin
  if n <= 0 then
    exit;
    
  if (n mod 2) <> 0 then
    result := new TreeNode<integer>(Random(a, b),
        CreateIdeallyBalanced(n div 2, a, b),
        CreateIdeallyBalanced(n div 2, a, b))
  else
  begin
    var left  := CreateIdeallyBalanced(n div 2, a, b);
    var right := CreateIdeallyBalanced(n div 2 - 1, a, b);
    if random(2) = 0 then
      swap(left, right);
    result := new TreeNode<integer>(Random(a, b), left, right);
  end;
end;

// разминка: лобовое решение
function IsIdeallyBalancedNaive(root : TreeNode<integer>) : boolean;
  
  function CountNodes(root : TreeNode<integer>) : integer;
  begin
    if root = nil then
      result := 0
    else  
      result := CountNodes(root.left) + CountNodes(root.right) + 1;
  end;

begin
  if root = nil then
    result := true
  else
    result :=
        (abs(CountNodes(root.left) - CountNodes(root.right)) < 2)
        and IsIdeallyBalancedNaive(root.left)
        and IsIdeallyBalancedNaive(root.right);
end;

// #7
function IsIdeallyBalanced(root : TreeNode<integer>) : boolean;

  function Impl(root : TreeNode<integer>;
                                  var nodeCount : integer): boolean;
  begin
    if root = nil then
    begin
      result := true;
      exit;
    end;
    var ncl, ncr : integer;
    var leftBalanced := Impl(root.left, ncl);
    var rightBalanced := Impl(root.right, ncr);
    result := leftBalanced and rightBalanced and (abs(ncr - ncl) < 2);
    nodeCount := ncl + ncr + 1;
  end;
  
begin
  var nc : integer;
  result := Impl(root, nc)
end;

begin
  //var r := CreateRandomTree();
//  var r := CreateIdeallyBalanced(6);
  var r := CreateLeftHandedTree(1, 2);
//  var r := CreateRandomBST();
  Print(r);
  //writeln('Идеально сбалансированное? ', IsIdeallyBalancedNaive(r));
  writeln('BST? ', IsBST(r));

end.