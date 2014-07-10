require 'mongoid'

class Classroom
  include Mongoid::Document

  has_many :groups
  field :groups, :type => Array, :default => []

  has_many :students
  field :students, :type => Array, :default => []

  field :label, :type => String
  field :teacherbadge, :type => Array, :default => []
end