require 'mongoid'

class Group
  include Mongoid::Document

  belongs_to :classroom

  has_many :students
  field :students, :type => Array, :default => []

  field :label, :type => String
  field :avatar_url, :type => String
  field :blog_url, :type => String
  field :score, :type => Integer, :default => 0
end